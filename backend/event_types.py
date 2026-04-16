from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, EventType

event_types_bp = Blueprint('event_types', __name__)

@event_types_bp.route('/api/event-types', methods=['GET'])
@jwt_required()
def get_event_types():
    types = EventType.query.filter_by(is_active=True).all()
    return jsonify([{'id': t.id, 'name': t.name, 'description': t.description} for t in types])

@event_types_bp.route('/api/event-types', methods=['POST'])
@jwt_required()
def add_event_type():
    data = request.get_json()
    existing = EventType.query.filter_by(name=data['name']).first()
    if existing:
        return jsonify({'msg': 'Event type already exists'}), 400
    event_type = EventType(name=data['name'], description=data.get('description', ''))
    db.session.add(event_type)
    db.session.commit()
    return jsonify({'msg': 'Event type added'}), 201