from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
import os
# ── Blueprints ────────────────────────────────────────────────────────────────
from routes.auth_routes import auth_bp
from routes.task_routes import task_bp
from routes.report_routes import report_bp
from routes.ai_routes import ai_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all routes (frontend on any port can call the API)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Init DB
    db.init_app(app)

    # Register blueprints (all routes under /api prefix)
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(task_bp, url_prefix="/api")
    app.register_blueprint(report_bp, url_prefix="/api")
    app.register_blueprint(ai_bp, url_prefix="/api")

    # Health check
    @app.route("/health")
    def health():
        return {"status": "ok", "app": "ProcastFlow API"}
    
    
    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))