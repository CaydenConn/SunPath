import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Example: write a user
def save_user(user_id, user_data):
    db.collection("users").document(user_id).set(user_data)

# Example: read a user
def get_user(user_id):
    return db.collection("users").document(user_id).get().to_dict()

# Example: delete a user
def delete_user(user_id):
    db.collection("users").document(user_id).delete()