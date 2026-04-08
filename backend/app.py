import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

# Initialise Firebase Admin SDK
cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if cred_path and os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
else:
    firebase_admin.initialize_app()

db = firestore.client()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/send-campaign", methods=["POST"])
def send_campaign():
    """Send phishing simulation emails (mock – logs instead of sending)."""
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


if __name__ == "__main__":
    app.run(debug=True, port=5000)
