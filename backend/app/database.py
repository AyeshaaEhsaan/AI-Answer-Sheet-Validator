import json
import os
from pathlib import Path

DATABASE_FILE = Path(__file__).parent / "users_db.json"

def init_database():
    """Initialize the database file if it doesn't exist"""
    if not DATABASE_FILE.exists():
        with open(DATABASE_FILE, 'w') as f:
            json.dump({"users": []}, f, indent=2)

def load_users():
    """Load all users from database"""
    init_database()
    with open(DATABASE_FILE, 'r') as f:
        data = json.load(f)
    return data.get("users", [])

def save_users(users):
    """Save users to database"""
    with open(DATABASE_FILE, 'w') as f:
        json.dump({"users": users}, f, indent=2)

def get_user_by_email(email):
    """Get a user by email"""
    users = load_users()
    for user in users:
        if user.get("email") == email:
            return user
    return None

def get_user_by_username(username):
    """Get a user by username"""
    users = load_users()
    for user in users:
        if user.get("username") == username:
            return user
    return None

def create_user(email, username, hashed_password):
    """Create a new user"""
    users = load_users()
    
    # Check if user already exists
    if get_user_by_email(email):
        return None
    if get_user_by_username(username):
        return None
    
    new_user = {
        "email": email,
        "username": username,
        "password": hashed_password
    }
    
    users.append(new_user)
    save_users(users)
    return new_user
