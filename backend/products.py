from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Product

products_bp = Blueprint('products', __name__)

def admin_required():
    claims = get_jwt()
    return claims.get('role') == 'admin'

@products_bp.route('/api/products', methods=['GET'])
@jwt_required()
def get_products():
    products = Product.query.all()
    return jsonify([{'id': p.id, 'name': p.name, 'price': p.price, 'description': p.description} for p in products])

@products_bp.route('/api/products', methods=['POST'])
@jwt_required()
def add_product():
    if not admin_required():
        return jsonify({'msg': 'Admin only'}), 403
    data = request.get_json()
    product = Product(name=data['name'], price=data['price'], description=data.get('description', ''))
    db.session.add(product)
    db.session.commit()
    return jsonify({'msg': 'Product added'}), 201

@products_bp.route('/api/products/<int:pid>', methods=['PUT'])
@jwt_required()
def update_product(pid):
    if not admin_required():
        return jsonify({'msg': 'Admin only'}), 403
    product = Product.query.get_or_404(pid)
    data = request.get_json()
    product.name = data.get('name', product.name)
    product.price = data.get('price', product.price)
    product.description = data.get('description', product.description)
    db.session.commit()
    return jsonify({'msg': 'Product updated'})


@products_bp.route('/api/products/<int:pid>', methods=['DELETE'])
@jwt_required()
def delete_product(pid):
    # Check admin role
    if not admin_required():
        return jsonify({'msg': 'Admin only'}), 403

    product = Product.query.get_or_404(pid)

    # Check if product is used in any bill_item
    from models import BillItem  # ensure import
    used_in_bills = BillItem.query.filter_by(product_id=pid).first()
    if used_in_bills:
        return jsonify({'msg': 'Cannot delete this product because it is used in existing bills. Remove the product from bills first or delete the bills.'}), 400

    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'msg': 'Product deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': f'Database error: {str(e)}'}), 500