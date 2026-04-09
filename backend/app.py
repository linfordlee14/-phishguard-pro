import os
import json
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

import firebase_admin
from firebase_admin import credentials, firestore
from ai_service import generate_risk_narrative, generate_campaign_debrief, generate_phishing_template, copilot_chat

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": [
        "http://localhost:5173",
        "https://phishguard-pro.vercel.app",
    ]}},
)


def init_firebase():
    """Initialise Firebase Admin SDK without crashing startup."""
    try:
        from dotenv import load_dotenv

        load_dotenv()

        if firebase_admin._apps:
            print("✅ Firebase Admin SDK already initialised")
            return

        service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON", "{}")
        credential_source = None

        if service_account_json and service_account_json != "{}":
            credential_source = json.loads(service_account_json)
        else:
            service_account_file = Path(__file__).with_name("serviceAccount.json")
            if service_account_file.exists():
                with service_account_file.open("r", encoding="utf-8") as handle:
                    credential_source = json.load(handle)

        if credential_source:
            firebase_admin.initialize_app(credentials.Certificate(credential_source))
            print("✅ Firebase Admin SDK initialised")
        else:
            print("❌ Firebase Admin SDK not initialised: credentials missing")
    except Exception as exc:
        print(f"❌ Firebase Admin SDK initialisation failed: {exc}")


def get_db():
    if not firebase_admin._apps:
        return None
    return firestore.client()


init_firebase()


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/send-campaign", methods=["POST"])
def send_campaign():
    """Send phishing simulation emails (mock – logs instead of sending)."""
    db = get_db()
    if db is None:
        return jsonify({"error": "Firebase not configured"}), 503

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing request body"}), 400

    campaign_id = data.get("campaignId")
    org_id = data.get("orgId")
    template_id = data.get("templateId")
    employee_ids = data.get("employeeIds", [])

    if not all([campaign_id, org_id, template_id, employee_ids]):
        return jsonify({"error": "Missing required fields"}), 400

    # Fetch template
    template_doc = db.collection("templates").document(template_id).get()
    if not template_doc.exists:
        return jsonify({"error": "Template not found"}), 404

    # Create campaign results for each employee
    batch = db.batch()
    for emp_id in employee_ids:
        result_ref = db.collection("campaignResults").document()
        batch.set(result_ref, {
            "campaignId": campaign_id,
            "employeeId": emp_id,
            "orgId": org_id,
            "outcome": "pending",
            "clickedAt": None,
            "reportedAt": None,
            "trainingStatus": "not_started",
            "trainingCompletedAt": None,
            "riskChange": "same",
        })
    batch.commit()

    # In production, this would send emails via SendGrid
    app.logger.info(
        "Campaign %s: mock-sent %d emails (template: %s)",
        campaign_id,
        len(employee_ids),
        template_id,
    )

    return jsonify({"success": True, "sentCount": len(employee_ids)})


@app.route("/api/campaign/<campaign_id>/stats", methods=["GET"])
def campaign_stats(campaign_id: str):
    """Get aggregated stats for a campaign."""
    db = get_db()
    if db is None:
        return jsonify({"error": "Firebase not configured"}), 503

    results = (
        db.collection("campaignResults")
        .where("campaignId", "==", campaign_id)
        .stream()
    )

    stats = {"sent": 0, "opened": 0, "clicked": 0, "reported": 0, "trainingCompleted": 0}
    for doc in results:
        data = doc.to_dict()
        stats["sent"] += 1
        outcome = data.get("outcome", "pending")
        if outcome == "clicked":
            stats["clicked"] += 1
        elif outcome == "reported":
            stats["reported"] += 1
        if data.get("trainingStatus") == "completed":
            stats["trainingCompleted"] += 1

    return jsonify(stats)


@app.route("/api/campaign/<campaign_id>/track-click", methods=["POST"])
def track_click(campaign_id: str):
    """Record that an employee clicked the phishing link."""
    db = get_db()
    if db is None:
        return jsonify({"error": "Firebase not configured"}), 503

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing request body"}), 400

    result_id = data.get("resultId")
    if not result_id:
        return jsonify({"error": "Missing resultId"}), 400

    result_ref = db.collection("campaignResults").document(result_id)
    result_doc = result_ref.get()
    if not result_doc.exists:
        return jsonify({"error": "Result not found"}), 404

    result_data = result_doc.to_dict()
    if result_data.get("campaignId") != campaign_id:
        return jsonify({"error": "Campaign ID mismatch"}), 400

    result_ref.update({
        "outcome": "clicked",
        "clickedAt": datetime.now(timezone.utc),
        "trainingStatus": "pending",
        "riskChange": "higher",
    })

    # Update employee click stats
    emp_id = result_data.get("employeeId")
    if emp_id:
        emp_ref = db.collection("employees").document(emp_id)
        emp_doc = emp_ref.get()
        if emp_doc.exists:
            emp_data = emp_doc.to_dict()
            emp_ref.update({
                "clickCount": (emp_data.get("clickCount", 0) + 1),
                "lastClickDate": datetime.now(timezone.utc),
                "riskScore": "high",
            })

    return jsonify({"success": True})


@app.route("/api/org/<org_id>/risk-summary", methods=["GET"])
def risk_summary(org_id: str):
    """Get organisation-level risk summary."""
    db = get_db()
    if db is None:
        return jsonify({"error": "Firebase not configured"}), 503

    employees = (
        db.collection("employees").where("orgId", "==", org_id).stream()
    )

    total = 0
    risk_counts = {"high": 0, "medium": 0, "low": 0}
    total_clicks = 0
    total_campaigns = 0

    for doc in employees:
        data = doc.to_dict()
        total += 1
        risk = data.get("riskScore", "low")
        if risk in risk_counts:
            risk_counts[risk] += 1
        total_clicks += data.get("clickCount", 0)
        total_campaigns += data.get("campaignsReceived", 0)

    avg_click_rate = (total_clicks / total_campaigns * 100) if total_campaigns > 0 else 0

    return jsonify({
        "totalEmployees": total,
        "riskDistribution": risk_counts,
        "avgClickRate": round(avg_click_rate, 1),
        "totalCampaigns": total_campaigns,
    })


@app.route("/api/ai/risk-narrative", methods=["POST"])
def ai_risk_narrative():
    data = request.get_json() or {}
    narrative = generate_risk_narrative(
        campaigns=data.get("campaigns", []),
        employees=data.get("employees", [])
    )
    return jsonify({"narrative": narrative})


@app.route("/api/ai/campaign-debrief", methods=["POST"])
def ai_campaign_debrief():
    data = request.get_json() or {}
    debrief = generate_campaign_debrief(
        campaign_name=data.get("campaignName", "Campaign"),
        stats=data.get("stats", {})
    )
    return jsonify({"debrief": debrief})


@app.route("/api/ai/generate-template", methods=["POST"])
def ai_generate_template():
    data = request.get_json() or {}
    result = generate_phishing_template(
        brand=data.get("brand", ""),
        scenario=data.get("scenario", ""),
        difficulty=data.get("difficulty", "medium")
    )
    return jsonify(result)


@app.route("/api/ai/copilot-chat", methods=["POST", "OPTIONS"])
def ai_copilot_chat():
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json() or {}
    response = copilot_chat(
        message=data.get("message", ""),
        context=data.get("context") or {},
    )
    return jsonify({"response": response})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true",
    )
