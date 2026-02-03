from flask import Blueprint, request, jsonify
from sqlalchemy import func
from datetime import datetime, timedelta

from ..db import db
from ..models import HealthLog, MonitoredService

stats_bp = Blueprint("stats", __name__)

def hours_ago(hours: int):
    return datetime.utcnow() - timedelta(hours=hours)

@stats_bp.route("/summary/<int:service_id>")
def service_summary(service_id):
    hours = int(request.args.get("hours", 24))

    service = MonitoredService.query.get(service_id)
    if not service:
        return {"error": "Service not found"}, 404

    since = hours_ago(hours)

    total = db.session.query(func.count()).filter(
        HealthLog.service_id == service_id,
        HealthLog.checked_at >= since
    ).scalar()

    up = db.session.query(func.count()).filter(
        HealthLog.service_id == service_id,
        HealthLog.is_up == True,
        HealthLog.checked_at >= since
    ).scalar()

    avg_latency = db.session.query(func.avg(HealthLog.response_time_ms)).filter(
        HealthLog.service_id == service_id,
        HealthLog.is_up == True,
        HealthLog.checked_at >= since
    ).scalar()

    return jsonify({
        "service_id": service_id,
        "name": service.name,
        "uptime_percent": round((up / total) * 100, 2) if total else 0,
        "avg_latency_ms": int(avg_latency) if avg_latency else None,
        "checks": total
    })
@stats_bp.route("/latency/<int:service_id>")
def latency_stats(service_id):
    hours = int(request.args.get("hours", 24))
    since = hours_ago(hours)

    avg_, min_, max_ = db.session.query(
        func.avg(HealthLog.response_time_ms),
        func.min(HealthLog.response_time_ms),
        func.max(HealthLog.response_time_ms),
    ).filter(
        HealthLog.service_id == service_id,
        HealthLog.is_up == True,
        HealthLog.checked_at >= since
    ).one()

    return jsonify({
        "avg_ms": int(avg_) if avg_ else None,
        "min_ms": min_,
        "max_ms": max_
    })
@stats_bp.route("/uptime/<int:service_id>")
def uptime(service_id):
    hours = int(request.args.get("hours", 24))
    since = hours_ago(hours)

    total = db.session.query(func.count()).filter(
        HealthLog.service_id == service_id,
        HealthLog.checked_at >= since
    ).scalar()

    up = db.session.query(func.count()).filter(
        HealthLog.service_id == service_id,
        HealthLog.is_up == True,
        HealthLog.checked_at >= since
    ).scalar()

    return jsonify({
        "uptime_percent": round((up / total) * 100, 2) if total else 0,
        "checks": total
    })
@stats_bp.route("/timeline/<int:service_id>")
def timeline(service_id):
    hours = int(request.args.get("hours", 6))
    since = hours_ago(hours)

    logs = HealthLog.query.filter(
        HealthLog.service_id == service_id,
        HealthLog.checked_at >= since
    ).order_by(HealthLog.checked_at.asc()).all()

    return jsonify([
        {
            "time": log.checked_at.isoformat(),
            "latency": log.response_time_ms,
            "is_up": log.is_up
        }
        for log in logs
    ])
