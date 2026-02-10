"""
Firebase Firestore client for F1 Telemetry Analyzer.

Replaces SQLAlchemy with Firebase Admin SDK for cloud-native NoSQL storage.
"""

import firebase_admin
from firebase_admin import credentials, firestore
import os
from typing import Optional

# Global Firestore client
_db: Optional[firestore.Client] = None


def initialize_firebase():
    """
    Initialize Firebase Admin SDK.
    
    Loads credentials from JSON file and initializes Firestore client.
    Called on application startup.
    """
    global _db
    
    if _db is not None:
        return _db
    
    cred_path = os.getenv('FIREBASE_CREDENTIALS', './firebase-credentials.json')
    
    try:
        # Initialize Firebase Admin
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        
        # Get Firestore client
        _db = firestore.client()
        print(f"✅ Firebase initialized successfully")
        return _db
        
    except Exception as e:
        print(f"⚠️  Firebase initialization failed: {str(e)}")
        print(f"   Make sure {cred_path} exists with valid credentials")
        print(f"   Backend will start but Firebase features won't work")
        return None


def get_db() -> firestore.Client:
    """
    Get Firestore client instance.
    
    Returns:
        Firestore client for database operations
    """
    global _db
    
    if _db is None:
        _db = initialize_firebase()
    
    return _db


# Collections
TELEMETRY_COLLECTION = 'telemetry_data'
LAP_ANALYSIS_COLLECTION = 'lap_analysis'
