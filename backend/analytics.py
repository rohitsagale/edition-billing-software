from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import db, Bill, Booking, Client
from sqlalchemy import func, extract
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/analytics/monthly-revenue', methods=['GET'])
@jwt_required()
def monthly_revenue():
    current_year = datetime.utcnow().year
    result = db.session.query(
        extract('month', Bill.created_at).label('month'),
        func.sum(Bill.grand_total).label('revenue')
    ).filter(extract('year', Bill.created_at) == current_year) \
     .group_by('month').order_by('month').all()
    data = {int(row[0]): float(row[1]) for row in result}
    # Fill missing months with 0
    months = [{'month': m, 'revenue': data.get(m, 0)} for m in range(1, 13)]
    return jsonify(months)

@analytics_bp.route('/api/analytics/dashboard-summary', methods=['GET'])
@jwt_required()
def dashboard_summary():
    total_clients = Client.query.count()
    total_bookings = Booking.query.count()
    total_revenue = db.session.query(func.sum(Bill.grand_total)).scalar() or 0
    pending_bookings = Booking.query.filter(Booking.status == 'pending').count()
    # Current month revenue
    now = datetime.utcnow()
    start_of_month = datetime(now.year, now.month, 1)
    month_revenue = db.session.query(func.sum(Bill.grand_total))\
        .filter(Bill.created_at >= start_of_month).scalar() or 0
    return jsonify({
        'total_clients': total_clients,
        'total_bookings': total_bookings,
        'total_revenue': total_revenue,
        'pending_bookings': pending_bookings,
        'month_revenue': month_revenue
    })

@analytics_bp.route('/api/analytics/top-clients', methods=['GET'])
@jwt_required()
def top_clients():
    clients = Client.query.order_by(Client.total_spent.desc()).limit(5).all()
    return jsonify([{
        'name': c.name,
        'total_spent': c.total_spent,
        'bookings_count': len(c.bookings)
    } for c in clients])