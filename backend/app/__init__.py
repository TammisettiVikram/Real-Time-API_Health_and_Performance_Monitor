from flask import Flask
from .config import Config
from .db import db
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    # 👇 THIS IS THE KEY LINE
    from . import models

    with app.app_context():
        db.create_all()

    from .routes.services import services_bp
    from .routes.logs import logs_bp

    app.register_blueprint(services_bp, url_prefix="/services")
    app.register_blueprint(logs_bp, url_prefix="/logs")

    return app
