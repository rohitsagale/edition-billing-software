from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import inspect, text
from config import Config
from models import db
from auth import auth_bp
from products import products_bp
from bills import bills_bp
from clients import clients_bp
from event_types import event_types_bp
from bookings import bookings_bp
from analytics import analytics_bp



def create_app():
    app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"])
    jwt = JWTManager(app)
    db.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(bills_bp)
    app.register_blueprint(clients_bp)
    app.register_blueprint(event_types_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(analytics_bp)

    with app.app_context():
        db.create_all()

        inspector = inspect(db.engine)
        if 'bill' in inspector.get_table_names():
            bill_columns = [col['name'] for col in inspector.get_columns('bill')]
            if 'booking_id' not in bill_columns:
                db.session.execute(text('ALTER TABLE bill ADD COLUMN booking_id INTEGER NULL'))
                db.session.commit()
                print("Added missing booking_id column to bill table")

        print("Database tables created (if not exist)")

    # Serve React frontend (production)
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path and (path.startswith('static') or '.' in path):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
    
    