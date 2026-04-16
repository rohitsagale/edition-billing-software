from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Bill, BillItem, Product, Booking, Client,EventType


bills_bp = Blueprint('bills', __name__)

@bills_bp.route('/api/bills', methods=['POST'])
@jwt_required()
def create_bill():
    user_id = get_jwt_identity()
    data = request.get_json()
    items = data['items']
    customer_name = data['customer_name']
    customer_phone = data.get('customer_phone', '')
    discount = data.get('discount', 0)
    tax = data.get('tax', 0)
    booking_id = data.get('booking_id')  # NEW: link to booking

    total_amount = 0
    bill_items = []
    for it in items:
        product = Product.query.get(it['product_id'])
        if not product:
            return jsonify({'msg': f'Product {it["product_id"]} not found'}), 400
        line_total = product.price * it['quantity']
        total_amount += line_total
        bill_items.append({
            'product_id': product.id,
            'quantity': it['quantity'],
            'unit_price': product.price,
            'total': line_total
        })

    grand_total = total_amount + tax - discount

    # Create or find client
    client = None
    if customer_phone:
        client = Client.query.filter_by(phone=customer_phone).first()
        if not client:
            client = Client(name=customer_name, phone=customer_phone)
            db.session.add(client)
            db.session.flush()

    bill = Bill(
        customer_name=customer_name,
        customer_phone=customer_phone,
        total_amount=total_amount,
        discount=discount,
        tax=tax,
        grand_total=grand_total,
        created_by=user_id,
        booking_id=booking_id
    )
    db.session.add(bill)
    db.session.flush()

    for bi in bill_items:
        item = BillItem(bill_id=bill.id, **bi)
        db.session.add(item)

    # If linked to a booking, update booking balance and bill_id
    if booking_id:
        booking = Booking.query.get(booking_id)
        if booking:
            booking.bill_id = bill.id
            # Reduce balance due by the grand total (assuming full payment)
            # Actually, the bill amount may be partial. For simplicity, we reduce balance.
            # But better to set balance due = total_amount - advance_paid - grand_total
            # We'll keep it simple: new balance = max(0, booking.total_amount - booking.advance_paid - grand_total)
            remaining = booking.total_amount - booking.advance_paid - grand_total
            booking.balance_due = max(0, remaining)
            db.session.add(booking)

    db.session.commit()
    return jsonify({'bill_id': bill.id, 'grand_total': grand_total}), 201

@bills_bp.route('/api/bills', methods=['GET'])
@jwt_required()
def get_bills():
    bills = Bill.query.order_by(Bill.created_at.desc()).all()
    return jsonify([{
        'id': b.id,
        'customer_name': b.customer_name,
        'grand_total': b.grand_total,
        'date': b.created_at.isoformat()
    } for b in bills])


@bills_bp.route('/api/bills/<int:bid>', methods=['GET'])
@jwt_required()
def get_bill_detail(bid):
    bill = Bill.query.get_or_404(bid)
    items = BillItem.query.filter_by(bill_id=bid).all()
    # Get event category if linked to booking
    event_category = None
    if bill.booking_id:
        booking = Booking.query.get(bill.booking_id)
        if booking and booking.event_type_id:
            event_type = EventType.query.get(booking.event_type_id)
            event_category = event_type.name if event_type else None
    return jsonify({
        'id': bill.id,
        'customer_name': bill.customer_name,
        'customer_phone': bill.customer_phone,
        'total_amount': bill.total_amount,
        'discount': bill.discount,
        'tax': bill.tax,
        'grand_total': bill.grand_total,
        'date': bill.created_at.isoformat(),
        'booking_id': bill.booking_id,
        'event_category': event_category,  
        'items': [{
            'product_name': Product.query.get(i.product_id).name,
            'quantity': i.quantity,
            'unit_price': i.unit_price,
            'total': i.total
        } for i in items]
    })    
