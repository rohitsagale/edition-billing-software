from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Booking, Client, EventType, Bill
from datetime import datetime

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/api/bookings', methods=['GET'])
@jwt_required()
def get_bookings():
    bookings = Booking.query.order_by(Booking.booking_date.desc()).all()
    return jsonify([{
        'id': b.id,
        'booking_date': b.booking_date.isoformat(),
        'event_date': b.event_date.isoformat(),
        'event_type_id': b.event_type_id,
        'event_type_name': EventType.query.get(b.event_type_id).name if b.event_type_id else None,
        'client_id': b.client_id,
        'client_name': b.client.name,
        'status': b.status,
        'total_amount': b.total_amount,
        'advance_paid': b.advance_paid,
        'balance_due': b.balance_due,
        'notes': b.notes,
        'bill_id': b.bill_id
    } for b in bookings])

@bookings_bp.route('/api/bookings', methods=['POST'])
@jwt_required()
def create_booking():
    data = request.get_json()
    # Validate client exists
    client = Client.query.get(data['client_id'])
    if not client:
        return jsonify({'msg': 'Client not found'}), 404
    # Optionally create bill later
    booking = Booking(
        event_date=datetime.fromisoformat(data['event_date']),
        event_type_id=data.get('event_type_id'),
        client_id=data['client_id'],
        status=data.get('status', 'confirmed'),
        notes=data.get('notes', ''),
        total_amount=data.get('total_amount', 0),
        advance_paid=data.get('advance_paid', 0)
    )
    booking.balance_due = booking.total_amount - booking.advance_paid
    db.session.add(booking)
    db.session.commit()
    # Update client total_spent (can be updated when final bill is generated)
    return jsonify({'msg': 'Booking created', 'id': booking.id}), 201

@bookings_bp.route('/api/bookings/<int:bid>', methods=['PUT'])
@jwt_required()
def update_booking(bid):
    booking = Booking.query.get_or_404(bid)
    data = request.get_json()
    booking.event_date = datetime.fromisoformat(data.get('event_date', booking.event_date.isoformat()))
    booking.event_type_id = data.get('event_type_id', booking.event_type_id)
    booking.status = data.get('status', booking.status)
    booking.notes = data.get('notes', booking.notes)
    booking.total_amount = data.get('total_amount', booking.total_amount)
    booking.advance_paid = data.get('advance_paid', booking.advance_paid)
    booking.balance_due = booking.total_amount - booking.advance_paid
    db.session.commit()
    return jsonify({'msg': 'Booking updated'})

@bookings_bp.route('/api/bookings/<int:bid>', methods=['DELETE'])
@jwt_required()
def delete_booking(bid):
    booking = Booking.query.get_or_404(bid)
    if booking.bill_id:
        return jsonify({'msg': 'Cannot delete booking with associated bill'}), 400
    db.session.delete(booking)
    db.session.commit()
    return jsonify({'msg': 'Booking deleted'})