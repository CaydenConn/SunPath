from flask import Blueprint, request, jsonify
from firebase_admin import auth
from functools import wraps
from datetime import datetime
from models.database import (
    create_user, get_user, update_user, delete_user, user_exists,
    add_favorite_address, remove_favorite_address, clear_all_favorites, add_recent_address,
    get_user_favorites, get_user_recent
)
from models.user import Address

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


@users_bp.route('/create', methods=['POST'])
@verify_firebase_token
def create_user_profile(uid):
    """
    Create a new user profile
    Expected to be called after Firebase Auth signup
    
    Request body: { "email": "user@example.com" }
    """
    data = request.get_json()
    
    # DEBUG: Print what we received
    print("=" * 50)
    print("CREATE USER PROFILE REQUEST")
    print(f"UID: {uid}")
    print(f"Request Body: {data}")
    print(f"Request Headers: {dict(request.headers)}")
    print("=" * 50)
    
    if not data or 'email' not in data:
        print(f"ERROR: Email is missing. Data: {data}")
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        # Check if user already exists
        print(f"Checking if user {uid} already exists...")
        exists = user_exists(uid)
        print(f"User exists: {exists}")
        
        if exists:
            print(f"ERROR: User profile already exists for uid: {uid}")
            return jsonify({'error': 'User profile already exists'}), 409
        
        # Create user
        print(f"Creating user profile for {uid} with email {data['email']}")
        user = create_user(uid, data['email'])
        print(f"SUCCESS: User profile created for {uid}")
        print(f"User data: {user.to_dict()}")
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        print(f"EXCEPTION in create_user_profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create user', 'details': str(e)}), 500


@users_bp.route('/profile', methods=['GET'])
@verify_firebase_token
def get_user_profile(uid):
    """
    Get user profile
    """
    try:
        user = get_user(uid)
        
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
        deleted = delete_user(uid)
        
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
        favorites = get_user_favorites(uid)
        
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
    
    # DEBUG: Print what we received
    print("=" * 50)
    print("ADD FAVORITE REQUEST")
    print(f"UID: {uid}")
    print(f"Request Body: {data}")
    print(f"Request Headers: {dict(request.headers)}")
    print("=" * 50)
    
    if not data or 'address' not in data or 'latitude' not in data or 'longitude' not in data:
        print(f"ERROR: Missing required fields. Data: {data}")
        return jsonify({'error': 'Address, latitude, and longitude are required'}), 400
    
    try:
        address = Address(
            address=data['address'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            label=data.get('label')
        )
        
        print(f"Address object created: {address}")
        print(f"About to call add_favorite_address for uid: {uid}")
        
        user = add_favorite_address(uid, address)
        
        print(f"Returned from add_favorite_address. User: {user}")
        
        if user is None:
            print(f"ERROR: User not found for uid: {uid}")
            return jsonify({'error': 'User not found'}), 404
        
        print(f"SUCCESS: Favorite added for user {uid}")
        print(f"User favorites: {user.favorite_addresses}")
        
        return jsonify({
            'message': 'Favorite added successfully',
            'favorites': [addr.to_dict() for addr in user.favorite_addresses]
        }), 200
        
    except Exception as e:
        print(f"EXCEPTION in add_favorite: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to add favorite', 'details': str(e)}), 500


@users_bp.route('/favorites', methods=['DELETE'])
@verify_firebase_token
def remove_favorite(uid):
    """
    Remove a favorite address by name and coordinates
    
    Request body:
    {
        "label": "Home",
        "latitude": 30.4383,  (optional - can be null for placeholder addresses)
        "longitude": -84.2807  (optional - can be null for placeholder addresses)
    }
    """
    data = request.get_json()
    
    if not data or 'label' not in data:
        return jsonify({'error': 'Label is required'}), 400
    
    try:
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        user = remove_favorite_address(uid, data['label'], latitude, longitude)
        
        if user is None:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'message': 'Favorite removed successfully',
            'favorites': [addr.to_dict() for addr in user.favorite_addresses]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to remove favorite', 'details': str(e)}), 500


@users_bp.route('/favorites/all', methods=['DELETE'])
@verify_firebase_token
def clear_favorites(uid):
    """
    Delete all favorite addresses for the user
    
    No request body required
    """
    try:
        user = clear_all_favorites(uid)
        
        if user is None:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'message': 'All favorites cleared successfully',
            'favorites': [addr.to_dict() for addr in user.favorite_addresses]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to clear favorites', 'details': str(e)}), 500


@users_bp.route('/recent', methods=['GET'])
@verify_firebase_token
def get_recent(uid):
    """
    Get user's recent addresses
    """
    try:
        recent = get_user_recent(uid)
        
        if recent is None:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'recent': [addr.to_dict() for addr in recent]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get recent addresses', 'details': str(e)}), 500


@users_bp.route('/recent', methods=['DELETE'])
@verify_firebase_token
def remove_recent(uid):
    """
    Remove a specific recent address by label and coordinates
    
    Request body:
    {
        "label": "Work",
        "latitude": 30.4383,  (optional - can be null)
        "longitude": -84.2807  (optional - can be null)
    }
    """
    data = request.get_json()
    
    if not data or 'label' not in data:
        return jsonify({'error': 'Label is required'}), 400
    
    try:
        from models.database import get_user, update_user
        
        user = get_user(uid)
        
        if user is None:
            return jsonify({'error': 'User not found'}), 404
        
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        # Remove the specific recent address
        original_length = len(user.recent_addresses)
        user.recent_addresses = [
            addr for addr in user.recent_addresses
            if not (addr.label == data['label'] and 
                   addr.latitude == latitude and 
                   addr.longitude == longitude)
        ]
        
        if len(user.recent_addresses) < original_length:
            user.updated_at = datetime.utcnow().isoformat()
            update_user(user)
            
            return jsonify({
                'message': 'Recent address removed successfully',
                'recent': [addr.to_dict() for addr in user.recent_addresses]
            }), 200
        else:
            return jsonify({'error': 'Recent address not found'}), 404
        
    except Exception as e:
        return jsonify({'error': 'Failed to remove recent address', 'details': str(e)}), 500


@users_bp.route('/recent/all', methods=['DELETE'])
@verify_firebase_token
def clear_all_recents(uid):
    """
    Delete all recent addresses for the user
    
    No request body required
    """
    try:
        from models.database import get_user, update_user
        
        user = get_user(uid)
        
        if user is None:
            return jsonify({'error': 'User not found'}), 404
        
        user.clear_recent_addresses()
        update_user(user)
        
        return jsonify({
            'message': 'All recent addresses cleared successfully',
            'recent': []
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to clear recent addresses', 'details': str(e)}), 500


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
        
        user = add_recent_address(uid, address)
        
        if user is None:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'message': 'Recent address added successfully',
            'recent': [addr.to_dict() for addr in user.recent_addresses]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to add recent address', 'details': str(e)}), 500

