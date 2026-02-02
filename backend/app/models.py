from .db import db

class MonitoredService(db.Model):
    __tablename__ = "monitored_services"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    url = db.Column(db.Text, nullable=False, unique=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())


class HealthLog(db.Model):
    __tablename__ = "health_logs"

    id = db.Column(db.BigInteger, primary_key=True)
    service_id = db.Column(
        db.Integer,
        db.ForeignKey("monitored_services.id", ondelete="CASCADE"),
        nullable=False,
    )
    status_code = db.Column(db.Integer)
    response_time_ms = db.Column(db.Integer)
    is_up = db.Column(db.Boolean, nullable=False)
    checked_at = db.Column(db.DateTime, server_default=db.func.now())
