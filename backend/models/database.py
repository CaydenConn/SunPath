import firebase_admin
from firebase_admin import credentials, firestore
from typing import Optional, List
from datetime import datetime
from .user import User, Address
import os

# Global Firestore client
db = None

def initialize_firebase():
    """
    Initialize Firebase Admin SDK
    Should be called once at application startup
    """
    global db
    
    if db is not None:
        return db  # Already initialized
    
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
    except ValueError:
        # Not initialized, initialize it
        cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH')
        
        if cred_path and os.path.exists(cred_path):
            # Initialize with credentials file
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Initialize with default credentials (for deployed environments)
            firebase_admin.initialize_app()
    
    db = firestore.client()
    return db


def get_firestore_client():
    """Get Firestore client, initializing if necessary"""
    global db
    if db is None:
        initialize_firebase()
    return db


# User CRUD Operations

async def create_user(uid: str, email: str) -> User:
    """
    Create a new user in Firestore
    
    Args:
        uid: Firebase Auth UID
        email: User's email address
        
    Returns:
        User object
    """
    db = get_firestore_client()
    
    now = datetime.utcnow().isoformat()
    user = User(
        uid=uid,
        email=email,
        created_at=now,
        updated_at=now,
        favorite_addresses=[],
        recent_addresses=[]
    )
    
    # Store in Firestore
    db.collection('users').document(uid).set(user.to_dict())
    
    return user


async def get_user(uid: str) -> Optional[User]:
    """
    Get a user from Firestore by UID
    
    Args:
        uid: Firebase Auth UID
        
    Returns:
        User object or None if not found
    """
    db = get_firestore_client()
    
    doc_ref = db.collection('users').document(uid)
    doc = doc_ref.get()
    
    if doc.exists:
        return User.from_dict(doc.to_dict())
    return None


async def update_user(user: User) -> User:
    """
    Update a user in Firestore
    
    Args:
        user: User object with updated data
        
    Returns:
        Updated User object
    """
    db = get_firestore_client()
    
    user.updated_at = datetime.utcnow().isoformat()
    
    db.collection('users').document(user.uid).update(user.to_dict())
    
    return user


async def delete_user(uid: str) -> bool:
    """
    Delete a user from Firestore
    
    Args:
        uid: Firebase Auth UID
        
    Returns:
        True if deleted, False if not found
    """
    db = get_firestore_client()
    
    doc_ref = db.collection('users').document(uid)
    
    if doc_ref.get().exists:
        doc_ref.delete()
        return True
    return False


async def user_exists(uid: str) -> bool:
    """
    Check if a user exists in Firestore
    
    Args:
        uid: Firebase Auth UID
        
    Returns:
        True if user exists, False otherwise
    """
    db = get_firestore_client()
    
    doc_ref = db.collection('users').document(uid)
    return doc_ref.get().exists


# Address Operations

async def add_favorite_address(uid: str, address: Address) -> Optional[User]:
    """
    Add a favorite address for a user
    
    Args:
        uid: Firebase Auth UID
        address: Address object to add
        
    Returns:
        Updated User object or None if user not found
    """
    user = await get_user(uid)
    if user is None:
        return None
    
    user.add_favorite_address(address)
    return await update_user(user)


async def remove_favorite_address(uid: str, latitude: float, longitude: float) -> Optional[User]:
    """
    Remove a favorite address for a user
    
    Args:
        uid: Firebase Auth UID
        latitude: Address latitude
        longitude: Address longitude
        
    Returns:
        Updated User object or None if user not found
    """
    user = await get_user(uid)
    if user is None:
        return None
    
    user.remove_favorite_address(latitude, longitude)
    return await update_user(user)


async def add_recent_address(uid: str, address: Address) -> Optional[User]:
    """
    Add a recent address for a user
    
    Args:
        uid: Firebase Auth UID
        address: Address object to add
        
    Returns:
        Updated User object or None if user not found
    """
    user = await get_user(uid)
    if user is None:
        return None
    
    user.add_recent_address(address)
    return await update_user(user)


async def get_user_favorites(uid: str) -> Optional[List[Address]]:
    """
    Get all favorite addresses for a user
    
    Args:
        uid: Firebase Auth UID
        
    Returns:
        List of Address objects or None if user not found
    """
    user = await get_user(uid)
    if user is None:
        return None
    
    return user.favorite_addresses


async def get_user_recent(uid: str) -> Optional[List[Address]]:
    """
    Get all recent addresses for a user
    
    Args:
        uid: Firebase Auth UID
        
    Returns:
        List of Address objects or None if user not found
    """
    user = await get_user(uid)
    if user is None:
        return None
    
    return user.recent_addresses

