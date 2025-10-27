# User Model & Firestore Integration Guide

## Overview

This backend now includes a complete user profile system that integrates with Firebase Authentication and Firestore. Users can store favorite addresses and recent navigation history.

## Architecture

### Components

1. **`models/user.py`** - User and Address data models
2. **`models/database.py`** - Firestore database operations
3. **`routes/users.py`** - REST API endpoints for user operations
4. **`application.py`** - Flask app with Firebase initialization

## Data Model

### User Document Structure (Firestore)

```json
{
  "uid": "firebase_auth_uid",
  "email": "user@example.com",
  "created_at": "2025-10-27T12:00:00",
  "updated_at": "2025-10-27T12:00:00",
  "favorite_addresses": [
    {
      "address": "123 Main St, City, State",
      "latitude": 30.4383,
      "longitude": -84.2807,
      "label": "Home"
    }
  ],
  "recent_addresses": [
    {
      "address": "456 Work Ave, City, State",
      "latitude": 30.4500,
      "longitude": -84.2900,
      "label": "Work",
      "timestamp": "2025-10-27T12:30:00"
    }
  ]
}
```

### Firestore Collection Structure

```
users/
  ├── {firebase_auth_uid_1}/
  │   └── (user document)
  ├── {firebase_auth_uid_2}/
  │   └── (user document)
  └── ...
```

## Setup

### 1. Firebase Service Account

You need a Firebase service account JSON file:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely (e.g., `firebase-credentials.json`)

### 2. Environment Variables

Add to your `.env` file:

```bash
FIREBASE_CREDENTIALS_PATH=/path/to/firebase-credentials.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 3. Firebase Firestore Setup

1. Go to Firebase Console → Firestore Database
2. Click "Create Database"
3. Start in production mode (or test mode for development)
4. Choose your region

## API Endpoints

All endpoints require Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

### Create User Profile

**POST** `/api/users/create`

Create a user profile after Firebase Auth signup.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "uid": "...",
    "email": "user@example.com",
    "created_at": "2025-10-27T12:00:00",
    "updated_at": "2025-10-27T12:00:00",
    "favorite_addresses": [],
    "recent_addresses": []
  }
}
```

### Get User Profile

**GET** `/api/users/profile`

Get the authenticated user's profile.

**Response:**
```json
{
  "user": {
    "uid": "...",
    "email": "user@example.com",
    "favorite_addresses": [...],
    "recent_addresses": [...]
  }
}
```

### Delete User Profile

**DELETE** `/api/users/profile`

Delete the user's Firestore profile (not the Firebase Auth account).

### Get Favorite Addresses

**GET** `/api/users/favorites`

**Response:**
```json
{
  "favorites": [
    {
      "address": "123 Main St",
      "latitude": 30.4383,
      "longitude": -84.2807,
      "label": "Home"
    }
  ]
}
```

### Add Favorite Address

**POST** `/api/users/favorites`

**Request Body:**
```json
{
  "address": "123 Main St, City, State",
  "latitude": 30.4383,
  "longitude": -84.2807,
  "label": "Home"
}
```

Note: Duplicates (same coordinates) are automatically prevented.

### Remove Favorite Address

**DELETE** `/api/users/favorites`

**Request Body:**
```json
{
  "latitude": 30.4383,
  "longitude": -84.2807
}
```

### Get Recent Addresses

**GET** `/api/users/recent`

Returns up to 10 most recent addresses (most recent first).

**Response:**
```json
{
  "recent": [
    {
      "address": "456 Work Ave",
      "latitude": 30.4500,
      "longitude": -84.2900,
      "label": "Work",
      "timestamp": "2025-10-27T12:30:00"
    }
  ]
}
```

### Add Recent Address

**POST** `/api/users/recent`

**Request Body:**
```json
{
  "address": "456 Work Ave, City, State",
  "latitude": 30.4500,
  "longitude": -84.2900,
  "label": "Work"
}
```

Note: 
- Automatically adds timestamp
- Keeps only 10 most recent (configurable)
- Removes duplicates
- Most recent first

## Frontend Integration

### 1. Get Firebase ID Token

After user logs in with Firebase Auth:

```typescript
import { FIREBASE_AUTH } from './FirebaseConfig';

const user = FIREBASE_AUTH.currentUser;
if (user) {
  const token = await user.getIdToken();
  // Use this token in API calls
}
```

### 2. Make API Calls

```typescript
const API_BASE_URL = 'http://localhost:5000';

// Create user profile after signup
async function createUserProfile(email: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ email })
  });
  return response.json();
}

// Get user profile
async function getUserProfile(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

// Add favorite address
async function addFavorite(address: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(address)
  });
  return response.json();
}

// Add recent address (for navigation tracking)
async function trackNavigation(address: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/recent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(address)
  });
  return response.json();
}
```

### 3. Complete Login Flow

```typescript
// In Login.tsx after successful signup
const signUp = async (): Promise<void> => {
  setLoading(true);
  try {
    const response = await createUserWithEmailAndPassword(auth, email, password);
    const token = await response.user.getIdToken();
    
    // Create user profile in Firestore
    await createUserProfile(email, token);
    
    console.log('User created with profile');
  } catch (error: any) {
    console.log(error);
    alert('Sign up failed: ' + error.message);
  } finally {
    setLoading(false);
  }
}
```

## Future Extensions

The User model is designed to be easily extensible. To add new fields:

### 1. Update the User Model

In `models/user.py`, add fields to the `User` dataclass:

```python
@dataclass
class User:
    uid: str
    email: str
    created_at: str
    updated_at: str
    favorite_addresses: List[Address] = field(default_factory=list)
    recent_addresses: List[Address] = field(default_factory=list)
    
    # NEW FIELDS HERE:
    display_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture_url: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
```

### 2. Update Serialization

Update `to_dict()` and `from_dict()` methods to include new fields.

### 3. Add API Endpoints

Add new routes in `routes/users.py` to manage the new fields.

## Security Notes

1. **Token Verification**: All endpoints verify Firebase ID tokens
2. **User Isolation**: Users can only access their own data (enforced by token verification)
3. **Firestore Rules**: Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Testing

### Test with cURL

```bash
# Get a token from Firebase (do this in your frontend console)
TOKEN="your_firebase_id_token"

# Create user
curl -X POST http://localhost:5000/api/users/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Get profile
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# Add favorite
curl -X POST http://localhost:5000/api/users/favorites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Main St",
    "latitude": 30.4383,
    "longitude": -84.2807,
    "label": "Home"
  }'
```

## Running the Backend

```bash
cd SunPath/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python application.py
```

Make sure your `.env` file is configured with Firebase credentials.

