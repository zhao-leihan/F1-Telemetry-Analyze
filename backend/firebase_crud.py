"""
Firebase CRUD operations for F1 Telemetry Analyzer.

Implements data operations using Firestore collections with MongoDB fallback.
"""

from firebase_client import get_db, TELEMETRY_COLLECTION, LAP_ANALYSIS_COLLECTION
from typing import List, Dict, Optional, Any
from datetime import datetime


def create_telemetry_point_firebase(lap_number: int, data_point: Dict[str, Any]) -> str:
    """
    Save a single telemetry data point to Firestore.
    
    Args:
        lap_number: Lap number this data belongs to
        data_point: Telemetry metrics (speed, throttle, brake, etc.)
    
    Returns:
        Document ID of created record
    """
    db = get_db()
    if not db:
        raise Exception("Firebase not initialized")
    
    doc_data = {
        "lap_number": lap_number,
        "timestamp": data_point.get("timestamp", 0),
        "speed": data_point.get("speed", 0),
        "throttle": data_point.get("throttle", 0),
        "brake": data_point.get("brake", 0),
        "gear": data_point.get("gear", 0),
        "rpm": data_point.get("rpm", 0),
        "drs": data_point.get("drs", 0),
        "created_at": datetime.utcnow()
    }
    
    doc_ref = db.collection(TELEMETRY_COLLECTION).add(doc_data)
    return doc_ref[1].id


def bulk_create_telemetry_firebase(lap_number: int, data_points: List[Dict[str, Any]]) -> int:
    """
    Batch save multiple telemetry points to Firestore.
    
    Args:
        lap_number: Lap number
        data_points: List of telemetry data points
    
    Returns:
        Number of points saved
    """
    db = get_db()
    if not db:
        raise Exception("Firebase not initialized")
    
    batch = db.batch()
    collection_ref = db.collection(TELEMETRY_COLLECTION)
    
    for point in data_points:
        doc_data = {
            "lap_number": lap_number,
            "timestamp": point.get("timestamp", 0),
            "speed": point.get("speed", 0),
            "throttle": point.get("throttle", 0),
            "brake": point.get("brake", 0),
            "gear": point.get("gear", 0),
            "rpm": point.get("rpm", 0),
            "drs": point.get("drs", 0),
            "created_at": datetime.utcnow()
        }
        doc_ref = collection_ref.document()
        batch.set(doc_ref, doc_data)
    
    batch.commit()
    return len(data_points)


def create_lap_summary_firebase(lap_number: int, lap_time: Optional[float] = None) -> str:
    """
    Create lap summary in Firestore.
    
    Args:
        lap_number: Lap number
        lap_time: Total lap time in seconds
    
    Returns:
        Document ID
    """
    db = get_db()
    if not db:
        raise Exception("Firebase not initialized")
    
    # Get first telemetry point for this lap to get metrics
    telemetry_docs = db.collection(TELEMETRY_COLLECTION)\
        .where("lap_number", "==", lap_number)\
        .limit(1)\
        .get()
    
    telemetry_data = {}
    if telemetry_docs:
        telemetry_data = telemetry_docs[0].to_dict()
    
    summary_data = {
        "lap_number": lap_number,
        "lap_time": lap_time or 0,
        "speed": telemetry_data.get("speed", 0),
        "throttle": telemetry_data.get("throttle", 0),
        "brake": telemetry_data.get("brake", 0),
        "gear": telemetry_data.get("gear", 0),
        "rpm": telemetry_data.get("rpm", 0),
        "created_at": datetime.utcnow(),
        "source": "firebase"
    }
    
    # Use lap_number as document ID for easy retrieval
    doc_ref = db.collection("lap_summaries").document(f"lap_{lap_number}")
    doc_ref.set(summary_data)
    
    return doc_ref.id


def get_all_laps_firebase() -> List[Dict[str, Any]]:
    """
    Get all lap summaries from Firestore.
    
    Returns:
        List of lap summary dictionaries
    """
    db = get_db()
    if not db:
        raise Exception("Firebase not initialized")
    
    laps_ref = db.collection("lap_summaries").order_by("lap_number").stream()
    
    laps = []
    for doc in laps_ref:
        lap_data = doc.to_dict()
        lap_data["id"] = doc.id
        laps.append(lap_data)
    
    return laps


def get_lap_telemetry_firebase(lap_number: int) -> List[Dict[str, Any]]:
    """
    Get all telemetry points for a specific lap from Firestore.
    
    Args:
        lap_number: Lap number to retrieve
    
    Returns:
        List of telemetry data points
    """
    db = get_db()
    if not db:
        raise Exception("Firebase not initialized")
    
    points_ref = db.collection(TELEMETRY_COLLECTION)\
        .where("lap_number", "==", lap_number)\
        .order_by("timestamp")\
        .stream()
    
    points = []
    for doc in points_ref:
        point_data = doc.to_dict()
        point_data["id"] = doc.id
        # Remove created_at for cleaner response
        point_data.pop("created_at", None)
        points.append(point_data)
    
    return points


def delete_lap_firebase(lap_number: int) -> int:
    """
    Delete all data for a specific lap from Firestore.
    
    Args:
        lap_number: Lap number to delete
    
    Returns:
        Number of documents deleted
    """
    db = get_db()
    if not db:
        raise Exception("Firebase not initialized")
    
    deleted_count = 0
    batch = db.batch()
    
    # Delete telemetry points
    telemetry_docs = db.collection(TELEMETRY_COLLECTION)\
        .where("lap_number", "==", lap_number)\
        .stream()
    
    for doc in telemetry_docs:
        batch.delete(doc.reference)
        deleted_count += 1
    
    # Delete lap summary
    summary_ref = db.collection("lap_summaries").document(f"lap_{lap_number}")
    if summary_ref.get().exists:
        batch.delete(summary_ref)
        deleted_count += 1
    
    batch.commit()
    return deleted_count
