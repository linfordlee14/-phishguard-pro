import os
import json
import hashlib
import ipaddress
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

import firebase_admin
from firebase_admin import credentials, firestore
from ai_service import generate_risk_narrative, generate_campaign_debrief, generate_phishing_template, copilot_chat

PLANS = {
    'starter': {'name': 'Starter Plan', 'amount': '399.00', 'seats': 10},
    'pro': {'name': 'Pro Plan', 'amount': '749.00', 'seats': 25},
    'business': {'name': 'Business Plan', 'amount': '1499.00', 'seats': 100},
}

PAYFAST_IP_RANGES = [
    ipaddress.ip_network('197.97.145.144/28'),
    ipaddress.ip_network('41.74.179.192/27'),
]

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": [
        "http://localhost:5173",
        "https://linfytech.xyz",
        "https://phishguard-pro.linfytech.xyz",
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


def build_payfast_param_string(params: dict, passphrase: str = "") -> str:
    encoded_pairs = []
    for key in sorted(params):
        if key == 'signature':
            continue

        value = params.get(key)
        if value is None or value == '':
            continue

        encoded_pairs.append(f"{key}={urllib.parse.quote_plus(str(value))}")

    param_string = '&'.join(encoded_pairs)
    if passphrase:
        param_string = f"{param_string}&passphrase={urllib.parse.quote_plus(passphrase)}" if param_string else f"passphrase={urllib.parse.quote_plus(passphrase)}"
    return param_string


def generate_payfast_signature(params: dict, passphrase: str = "") -> str:
    param_string = build_payfast_param_string(params, passphrase)
    return hashlib.md5(param_string.encode('utf-8')).hexdigest()


def get_request_ip() -> str:
    forwarded_for = request.headers.get('X-Forwarded-For', '')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.remote_addr or ''


def is_payfast_ip_allowed(ip_address: str) -> bool:
    try:
        parsed_ip = ipaddress.ip_address(ip_address)
    except ValueError:
        return False

    return any(parsed_ip in allowed_range for allowed_range in PAYFAST_IP_RANGES)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/billing/create-checkout", methods=["POST"])
def create_checkout():
    data = request.get_json() or {}

    plan_id = data.get('planId')
    user_id = data.get('userId')
    email = data.get('email')
    org_id = data.get('orgId')

    if plan_id not in PLANS:
        return jsonify({'error': 'Invalid planId'}), 400

    if not all([user_id, email, org_id]):
        return jsonify({'error': 'Missing required fields'}), 400

    sandbox = os.environ.get('PAYFAST_SANDBOX', 'true').lower() == 'true'
    base_url = 'https://sandbox.payfast.co.za/eng/process' if sandbox else 'https://www.payfast.co.za/eng/process'
    passphrase = os.environ.get('PAYFAST_PASSPHRASE', '').strip()

    params = {
        'merchant_id': os.environ.get('PAYFAST_MERCHANT_ID', '10000100'),
        'merchant_key': os.environ.get('PAYFAST_MERCHANT_KEY', '46f0cd694581a'),
        'return_url': f"{os.environ.get('APP_URL', 'https://phishguard-pro.linfytech.xyz')}/billing/success?plan={plan_id}",
        'cancel_url': f"{os.environ.get('APP_URL', 'https://phishguard-pro.linfytech.xyz')}/billing",
        'notify_url': f"{os.environ.get('BACKEND_URL', 'http://localhost:8001')}/api/billing/webhook",
        'amount': PLANS[plan_id]['amount'],
        'item_name': f"PhishGuard Pro - {PLANS[plan_id]['name']}",
        'custom_str1': org_id,
        'custom_str2': plan_id,
        'custom_str3': user_id,
        'email_address': email,
    }

    params['signature'] = generate_payfast_signature(params, passphrase)
    payment_url = f"{base_url}?{urllib.parse.urlencode(params)}"

    return jsonify({'paymentUrl': payment_url})


@app.route("/api/billing/webhook", methods=["POST"])
def billing_webhook():
    form_data = request.form.to_dict(flat=True)
    if form_data.get('payment_status') != 'COMPLETE':
        return 'OK', 200

    passphrase = os.environ.get('PAYFAST_PASSPHRASE', '').strip()
    posted_signature = form_data.get('signature', '')
    expected_signature = generate_payfast_signature({k: v for k, v in form_data.items() if k != 'signature'}, passphrase)

    if expected_signature != posted_signature:
        app.logger.warning('PayFast webhook signature mismatch for org %s', form_data.get('custom_str1'))
        return 'OK', 200

    sandbox = os.environ.get('PAYFAST_SANDBOX', 'true').lower() == 'true'
    if not sandbox:
        request_ip = get_request_ip()
        if not is_payfast_ip_allowed(request_ip):
            app.logger.warning('Rejected PayFast webhook from IP %s', request_ip)
            return 'OK', 200

    org_id = form_data.get('custom_str1')
    plan_id = form_data.get('custom_str2')
    user_id = form_data.get('custom_str3')

    if not org_id or not plan_id or not user_id or plan_id not in PLANS:
        app.logger.warning('PayFast webhook missing required identifiers: %s', form_data)
        return 'OK', 200

    db = get_db()
    if db is None:
        app.logger.warning('PayFast webhook received but Firebase is not configured')
        return 'OK', 200

    db.collection('organizations').document(org_id).set({
        'plan': plan_id,
        'seatsLimit': PLANS[plan_id]['seats'],
        'planActivatedAt': firestore.SERVER_TIMESTAMP,
        'billingStatus': 'active',
    }, merge=True)

    return 'OK', 200


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
