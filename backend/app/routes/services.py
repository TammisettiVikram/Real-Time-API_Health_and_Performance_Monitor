from flask import Blueprint, request, jsonify
from ..db import db
from ..models import HealthLog, MonitoredService

services_bp = Blueprint("services", __name__)

@services_bp.route("", methods=["GET"])
def list_services():
    services = MonitoredService.query.all()
    return jsonify([
        {
            "id": s.id,
            "name": s.name,
            "url": s.url,
            "is_active": s.is_active,
            "consecutive_failures": s.consecutive_failures or 0,
            "alert_enabled": bool(s.alert_enabled)
        } for s in services
    ])


@services_bp.route("", methods=["POST"])
def create_service():
    data = request.json
    service = MonitoredService(
        name=data["name"],
        url=data["url"]
    )
    db.session.add(service)
    db.session.commit()
    return jsonify({"message": "Service added"}), 201

@services_bp.route("/<int:service_id>", methods=["DELETE"])
def delete_service(service_id):
    service = MonitoredService.query.get(service_id)

    if not service:
        return {"error": "Service not found"}, 404

    # delete related logs first
    HealthLog.query.filter_by(service_id=service_id).delete()

    db.session.delete(service)
    db.session.commit()

    return {"message": "Service deleted"}


@services_bp.route("/<int:service_id>/alerts", methods=["PATCH"])
def update_alerts(service_id):
    service = MonitoredService.query.get(service_id)
    if not service:
        return {"error": "Service not found"}, 404

    data = request.get_json(silent=True) or {}
    if "alert_enabled" not in data:
        return {"error": "alert_enabled is required"}, 400

    service.alert_enabled = bool(data["alert_enabled"])
    db.session.commit()

    return {"message": "Alert setting updated", "alert_enabled": service.alert_enabled}


@services_bp.route("/<int:service_id>/failures", methods=["PUT"])
def update_failures(service_id):
    service = MonitoredService.query.get(service_id)
    if not service:
        return {"error": "Service not found"}, 404

    data = request.get_json(silent=True) or {}
    if "consecutive_failures" not in data:
        return {"error": "consecutive_failures is required"}, 400

    try:
        failures = int(data["consecutive_failures"])
    except (TypeError, ValueError):
        return {"error": "consecutive_failures must be an integer"}, 400

    service.consecutive_failures = max(failures, 0)
    db.session.commit()

    return {
        "message": "Consecutive failures updated",
        "consecutive_failures": service.consecutive_failures,
    }

@services_bp.route("/<int:service_id>/alerts", methods=["PATCH"])
def toggle_alerts(service_id):
    service = MonitoredService.query.get(service_id)
    if not service:
        return {"error": "Service not found"}, 404

    data = request.json
    service.alert_enabled = data.get("alert_enabled", service.alert_enabled)

    db.session.commit()
    return {"message": "Alert preference updated"}
