from flask import Blueprint, request, jsonify
from ..db import db
from ..models import HealthLog
logs_bp = Blueprint('logs_bp', __name__)

@logs_bp.route("", methods=["POST"])
def create_log():
    data = request.json

    log = HealthLog(
        service_id=data["service_id"],
        status_code=data.get("status_code"),
        response_time_ms=data.get("response_time_ms"),
        is_up=data["is_up"]
    )

    db.session.add(log)
    db.session.commit()

    return {"message": "Log saved"}, 201