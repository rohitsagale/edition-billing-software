from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Client, Booking
from sqlalchemy import func

clients_bp = Blueprint('clients', __name__)

@clients_bp.route('/api/clients', methods=['GET'])
@jwt_required()
def get_clients():
    clients = Client.query.order_by(Client.created_at.desc()).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'phone': c.phone,
        'email': c.email,
        'address': c.address,
        'total_spent': c.total_spent,
        'created_at': c.created_at.isoformat()
    } for c in clients])

@clients_bp.route('/api/clients', methods=['POST'])
@jwt_required()
def add_client():
    data = request.get_json()
    existing = Client.query.filter_by(phone=data['phone']).first()
    if existing:
        return jsonify({'msg': 'Client with this phone already exists'}), 400
    client = Client(
        name=data['name'],
        phone=data['phone'],
        email=data.get('email', ''),
        address=data.get('address', '')
    )
    db.session.add(client)
    db.session.commit()
    return jsonify({'msg': 'Client added', 'id': client.id}), 201

@clients_bp.route('/api/clients/<int:cid>', methods=['PUT'])
@jwt_required()
def update_client(cid):
    client = Client.query.get_or_404(cid)
    data = request.get_json()
    client.name = data.get('name', client.name)
    client.phone = data.get('phone', client.phone)
    client.email = data.get('email', client.email)
    client.address = data.get('address', client.address)
    db.session.commit()
    return jsonify({'msg': 'Client updated'})

@clients_bp.route('/api/clients/<int:cid>', methods=['DELETE'])
@jwt_required()
def delete_client(cid):
    client = Client.query.get_or_404(cid)
    # Check if has bookings
    if client.bookings:
        return jsonify({'msg': 'Cannot delete client with existing bookings'}), 400
    db.session.delete(client)
    db.session.commit()
    return jsonify({'msg': 'Client deleted'})