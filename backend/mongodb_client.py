"""
MongoDB Client for F1 Telemetry Analyzer

Handles MongoDB connection and provides database access.
Replaces Firebase Firestore with local MongoDB instance.
"""

from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DATABASE_NAME = "F1_TA"

# Sync client for simple operations
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

# Async client for FastAPI async operations
async_client = AsyncIOMotorClient(MONGO_URI)
async_db = async_client[DATABASE_NAME]

# Collections
telemetry_collection = db["telemetry_data"]
analysis_collection = db["lap_analysis"]
lap_summary_collection = db["lap_summaries"]

# Async collections
async_telemetry_collection = async_db["telemetry_data"]
async_analysis_collection = async_db["lap_analysis"]
async_lap_summary_collection = async_db["lap_summaries"]


def get_db():
    """Get synchronous database instance"""
    return db


def get_async_db():
    """Get asynchronous database instance"""
    return async_db


def init_db():
    """
    Initialize database with indexes
    """
    # Create indexes for better query performance
    telemetry_collection.create_index([("lap_number", 1), ("timestamp", 1)])
    analysis_collection.create_index("lap_number", unique=True)
    lap_summary_collection.create_index("lap_number", unique=True)
    
    print(f"✅ MongoDB initialized: {DATABASE_NAME}")
    print(f"📊 Collections: telemetry_data, lap_analysis, lap_summaries")


def test_connection():
    """Test MongoDB connection"""
    try:
        # Ping database
        client.admin.command('ping')
        print(f"✅ MongoDB connected successfully to {MONGO_URI}")
        print(f"📦 Database: {DATABASE_NAME}")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False


if __name__ == "__main__":
    # Test connection when run directly
    test_connection()
    init_db()
