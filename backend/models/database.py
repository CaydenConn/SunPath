import firebase_admin
from firebase_admin import credentials, firestore
from typing import Optional, List
from datetime import datetime
from .user import User, Address
import os
from concurrent.futures import ThreadPoolExecutor, TimeoutError
import functools

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
    
    # Use REST API transport to avoid gRPC issues
    try:
        from google.cloud.firestore import Client
        from google.auth import credentials as google_creds
        from google.auth.credentials import AnonymousCredentials
        
        # Get the Firebase app
        app = firebase_admin.get_app()
        
        # Create Firestore client with explicit settings
        db = firestore.client()
        print("[DB] Firestore client initialized successfully")
    except Exception as e:
        print(f"[DB] Error initializing Firestore client: {str(e)}")
        raise
    
    return db


def get_firestore_client():
    """Get Firestore client, initializing if necessary"""
    global db
    if db is None:
        initialize_firebase()
    return db


# User CRUD Operations

def create_user(uid: str, email: str) -> User:
    """
    Create a new user in Firestore with default favorite addresses
    
    Args:
        uid: Firebase Auth UID
        email: User's email address
        
    Returns:
        User object
    """
    db = get_firestore_client()
    
    now = datetime.utcnow().isoformat()
    
    # Create default favorite addresses with labels but no coordinates
    default_favorites = [
        Address(label="Home"),
        Address(label="Work")
    ]
    
    user = User(
        uid=uid,
        email=email,
        created_at=now,
        updated_at=now,
        favorite_addresses=default_favorites,
        recent_addresses=[]
    )
    
    # Store in Firestore
    db.collection('users').document(uid).set(user.to_dict())
    
    return user


def get_user(uid: str) -> Optional[User]:
    """
    Get a user from Firestore by UID
    
    Args:
        uid: Firebase Auth UID
        
    Returns:
        User object or None if not found
    """
    print(f"[DB] get_user called for uid: {uid}")
    db = get_firestore_client()
    print(f"[DB] Firestore client obtained")
    
    doc_ref = db.collection('users').document(uid)
    print(f"[DB] Getting document from Firestore...")
    
    try:
        # Add timeout to prevent hanging
        executor = ThreadPoolExecutor(max_workers=1)
        future = executor.submit(lambda: doc_ref.get())
        doc = future.result(timeout=10)  # 10 second timeout
        print(f"[DB] Document retrieved. Exists: {doc.exists}")
        
        if doc.exists:
            user_data = doc.to_dict()
            print(f"[DB] User data: {user_data}")
            return User.from_dict(user_data)
        return None
    except TimeoutError:
        print(f"[DB] ERROR: Timeout waiting for Firestore response")
        raise Exception("Firestore operation timed out")
    except Exception as e:
        print(f"[DB] ERROR: Exception in get_user: {str(e)}")
        raise


def update_user(user: User) -> User:
    """
    Update a user in Firestore
    
    Args:
        user: User object with updated data
        
    Returns:
        Updated User object
    """
    print(f"[DB] update_user called for uid: {user.uid}")
    db = get_firestore_client()
    
    user.updated_at = datetime.utcnow().isoformat()
    print(f"[DB] Updated timestamp: {user.updated_at}")
    
    print(f"[DB] Updating document in Firestore...")
    db.collection('users').document(user.uid).update(user.to_dict())
    print(f"[DB] Document updated successfully")
    
    return user


def delete_user(uid: str) -> bool:
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


def user_exists(uid: str) -> bool:
    """
    Check if a user exists in Firestore
    
    Args:
        uid: Firebase Auth UID
        
    Returns:
        True if user exists, False otherwise
    """
    print(f"[DB] user_exists called for uid: {uid}")
    db = get_firestore_client()
    print(f"[DB] Firestore client obtained")
    
    doc_ref = db.collection('users').document(uid)
    print(f"[DB] Getting document to check existence...")
    
    try:
        # Add timeout to prevent hanging
        executor = ThreadPoolExecutor(max_workers=1)
        future = executor.submit(lambda: doc_ref.get())
        doc = future.result(timeout=10)  # 10 second timeout
        exists = doc.exists
        print(f"[DB] Document exists: {exists}")
        return exists
    except TimeoutError:
        print(f"[DB] ERROR: Timeout waiting for Firestore response")
        raise Exception("Firestore operation timed out")
    except Exception as e:
        print(f"[DB] ERROR: Exception in user_exists: {str(e)}")
        raise


# Address Operations

def add_favorite_address(uid: str, address: Address) -> Optional[User]:
    """
    Add a favorite address for a user
    
    Args:
        uid: Firebase Auth UID
        address: Address object to add
        
    Returns:
        Updated User object or None if user not found
    """
    print(f"[DB] add_favorite_address called for uid: {uid}")
    print(f"[DB] Address: {address}")
    
    print(f"[DB] Getting user...")
    user = get_user(uid)
    print(f"[DB] Got user: {user}")
    
    if user is None:
        print(f"[DB] User is None, returning None")
        return None
    
    print(f"[DB] Adding address to user's favorites...")
    user.add_favorite_address(address)
    print(f"[DB] Address added. User now has {len(user.favorite_addresses)} favorites")
    
    print(f"[DB] Updating user in Firestore...")
    result = update_user(user)
    print(f"[DB] User updated successfully")
    return result


def remove_favorite_address(uid: str, label: str, latitude: Optional[float], longitude: Optional[float]) -> Optional[User]:
    """
    Remove a favorite address for a user by label and coordinates
    
    Args:
        uid: Firebase Auth UID
        label: Address label (e.g., "Home", "Work")
        latitude: Address latitude (optional)
        longitude: Address longitude (optional)
        
    Returns:
        Updated User object or None if user not found
    """
    user = get_user(uid)
    if user is None:
        return None
    
    user.remove_favorite_address(label, latitude, longitude)
    return update_user(user)


def clear_all_favorites(uid: str) -> Optional[User]:
    """
    Clear all favorite addresses for a user
    
    Args:
        uid: Firebase Auth UID
        
    Returns:
        Updated User object or None if user not found
    """
    user = get_user(uid)
    if user is None:
        return None
    
    user.clear_favorite_addresses()
    return update_user(user)


def add_recent_address(uid: str, address: Address) -> Optional[User]:
    """
    Add a recent address for a user
    
    Args:
        uid: Firebase Auth UID
        address: Address object to add
        
    Returns:
        Updated User object or None if user not found
    """
    user = get_user(uid)
    if user is None:
        return None
    
    user.add_recent_address(address)
    return update_user(user)


def get_user_favorites(uid: str) -> Optional[List[Address]]:
    """
    Get all favorite addresses for a user
    
    Args:
        uid: Firebase Auth UID
        
    Returns:
        List of Address objects or None if user not found
    """
    user = get_user(uid)
    if user is None:
        return None
    
    return user.favorite_addresses


def get_user_recent(uid: str) -> Optional[List[Address]]:
    """
    Get all recent addresses for a user
    
    Args:
        uid: Firebase Auth UID
        
    Returns:
        List of Address objects or None if user not found
    """
    user = get_user(uid)
    if user is None:
        return None
    
    return user.recent_addresses

