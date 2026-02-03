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
            "is_active": s.is_active
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
