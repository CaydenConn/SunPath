from flask import Blueprint, request, jsonify
from firebase_admin import auth
from functools import wraps
from models.database import (
    create_user, get_user, update_user, delete_user, user_exists,
    add_favorite_address, remove_favorite_address, add_recent_address,
    get_user_favorites, get_user_recent
)
from models.user import Address
import asyncio

users_bp = Blueprint('users', __name__, url_prefix='/api/users')


def verify_firebase_token(f):
    """
    Decorator to verify Firebase ID token from request headers
    Adds 'uid' to kwargs if token is valid
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token provided'}), 401
        
        token = auth_header.split('Bearer ')[1]
        
        try:
            # Verify the token
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            
            # Add uid to kwargs
            kwargs['uid'] = uid
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
    
    return decorated_function


# Helper function to run async functions
def run_async(coro):
    """Run an async function in a new event loop"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@users_bp.route('/create', methods=['POST'])
@verify_firebase_token
def create_user_profile(uid):
    """
    Create a new user profile
    Expected to be called after Firebase Auth signup
    
    Request body: { "email": "user@example.com" }
    """
    data = request.get_json()
    
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        # Check if user already exists
        if run_async(user_exists(uid)):
            return jsonify({'error': 'User profile already exists'}), 409
        
        # Create user
        user = run_async(create_user(uid, data['email']))
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to create user', 'details': str(e)}), 500


@users_bp.route('/profile', methods=['GET'])
@verify_firebase_token
def get_user_profile(uid):
    """
    Get user profile
    """
    try:
        user = run_async(get_user(uid))
        
        if user is None:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user', 'details': str(e)}), 500


@users_bp.route('/profile', methods=['DELETE'])
@verify_firebase_token
def delete_user_profile(uid):
    """
    Delete user profile
    Note: This only deletes the Firestore profile, not the Firebase Auth account
    """
    try:
        deleted = run_async(delete_user(uid))
        
        if not deleted:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to delete user', 'details': str(e)}), 500


@users_bp.route('/favorites', methods=['GET'])
@verify_firebase_token
def get_favorites(uid):
    """
    Get user's favorite addresses
    """
    try:
        favorites = run_async(get_user_favorites(uid))
        
        if favorites is None:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'favorites': [addr.to_dict() for addr in favorites]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get favorites', 'details': str(e)}), 500


@users_bp.route('/favorites', methods=['POST'])
@verify_firebase_token
def add_favorite(uid):
    """
    Add a favorite address
    
    Request body:
    {
        "address": "123 Main St, City, State",
        "latitude": 30.4383,
        "longitude": -84.2807,
        "label": "Home" (optional)
    }
    """
    data = request.get_json()
    
    if not data or 'address' not in data or 'latitude' not in data or 'longitude' not in data:
        return jsonify({'error': 'Address, latitude, and longitude are required'}), 400
    
    try:
        address = Address(
            address=data['address'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            label=data.get('label')
        )
        
        user = run_async(add_favorite_address(uid, address))
        
        if user is None:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'message': 'Favorite added successfully',
            'favorites': [addr.to_dict() for addr in user.favorite_addresses]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to add favorite', 'details': str(e)}), 500


@users_bp.route('/favorites', methods=['DELETE'])
@verify_firebase_token
def remove_favorite(uid):
    """
    Remove a favorite address
    
    Request body:
    {
        "latitude": 30.4383,
        "longitude": -84.2807
    }
    """
    data = request.get_json()
    
    if not data or 'latitude' not in data or 'longitude' not in data:
        return jsonify({'error': 'Latitude and longitude are required'}), 400
    
    try:
        user = run_async(remove_favorite_address(uid, data['latitude'], data['longitude']))
        
        if user is None:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'message': 'Favorite removed successfully',
            'favorites': [addr.to_dict() for addr in user.favorite_addresses]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to remove favorite', 'details': str(e)}), 500


@users_bp.route('/recent', methods=['GET'])
@verify_firebase_token
def get_recent(uid):
    """
    Get user's recent addresses
    """
    try:
        recent = run_async(get_user_recent(uid))
        
        if recent is None:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'recent': [addr.to_dict() for addr in recent]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get recent addresses', 'details': str(e)}), 500


@users_bp.route('/recent', methods=['POST'])
@verify_firebase_token
def add_recent(uid):
    """
    Add a recent address
    
    Request body:
    {
        "address": "123 Main St, City, State",
        "latitude": 30.4383,
        "longitude": -84.2807,
        "label": "Work" (optional)
    }
    """
    data = request.get_json()
    
    if not data or 'address' not in data or 'latitude' not in data or 'longitude' not in data:
        return jsonify({'error': 'Address, latitude, and longitude are required'}), 400
    
    try:
        address = Address(
            address=data['address'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            label=data.get('label')
        )
        
        user = run_async(add_recent_address(uid, address))
        
        if user is None:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'message': 'Recent address added successfully',
            'recent': [addr.to_dict() for addr in user.recent_addresses]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to add recent address', 'details': str(e)}), 500

