from flask import Blueprint, request, jsonify
from ..db import db
from ..models import HealthLog, MonitoredService

logs_bp = Blueprint("logs", __name__)

@logs_bp.route("", methods=["POST"])
def create_log():
    data = request.get_json(silent=True) or {}

    service_id = data.get("service_id")
    if not service_id:
        return {"error": "service_id is required"}, 400

    service = MonitoredService.query.get(service_id)
    if not service:
        return {"error": "Service not found"}, 400

    log = HealthLog(
        service_id=service_id,
        status_code=data.get("status_code"),
        response_time_ms=data.get("response_time_ms"),
        is_up=bool(data.get("is_up"))
    )

    db.session.add(log)
    db.session.commit()

    return {"message": "Log saved"}, 201