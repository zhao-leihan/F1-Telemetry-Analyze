"""
CRUD operations for F1 telemetry data using MongoDB.

Replaces Firebase Firestore operations with MongoDB queries.
"""

from typing import List, Dict, Optional, Any
from datetime import datetime
from bson import ObjectId
import schemas
from mongodb_client import (
    telemetry_collection,
    analysis_collection,
    lap_summary_collection,
    get_db
)


def create_telemetry_data(data_point: schemas.TelemetryDataPoint) -> Dict[str, Any]:
    """
    Store a single telemetry data point in MongoDB.
    
    Args:
        data_point: Validated telemetry data point
    
    Returns:
        Created document with ID
    """
    doc_data = data_point.model_dump()
    doc_data['created_at'] = datetime.utcnow()
    
    result = telemetry_collection.insert_one(doc_data)
    doc_data['_id'] = str(result.inserted_id)
    
    return doc_data


def bulk_create_telemetry(data_points: List[Dict[str, Any]]) -> int:
    """
    Efficiently store multiple telemetry data points.
    
    Args:
        data_points: List of telemetry data dictionaries
    
    Returns:
        Number of documents inserted
    """
    if not data_points:
        return 0
    
    # Add timestamps
    for point in data_points:
        point['created_at'] = datetime.utcnow()
    
    result = telemetry_collection.insert_many(data_points)
    return len(result.inserted_ids)


def get_telemetry_by_lap(lap_number: int) -> List[Dict[str, Any]]:
    """
    Retrieve all telemetry data for a specific lap.
    
    Args:
        lap_number: Lap number to retrieve
    
    Returns:
        List of telemetry data points sorted by timestamp
    """
    cursor = telemetry_collection.find({"lap_number": lap_number}).sort("timestamp", 1)
    
    # Convert to list and handle ObjectId
    telemetry_data = []
    for doc in cursor:
        doc['_id'] = str(doc['_id'])
        telemetry_data.append(doc)
    
    return telemetry_data


def save_lap_analysis(lap_number: int, analysis: Dict[str, Any]) -> str:
    """
    Save or update AI analysis for a lap.
    
    Args:
        lap_number: Lap number
        analysis: Analysis results dictionary
    
    Returns:
        Document ID
    """
    analysis['lap_number'] = lap_number
    analysis['created_at'] = datetime.utcnow()
    
    # Upsert: update if exists, insert if not
    result = analysis_collection.update_one(
        {"lap_number": lap_number},
        {"$set": analysis},
        upsert=True
    )
    
    if result.upserted_id:
        return str(result.upserted_id)
    else:
        # Find the existing document
        doc = analysis_collection.find_one({"lap_number": lap_number})
        return str(doc['_id'])


def get_lap_analysis(lap_number: int) -> Optional[Dict[str, Any]]:
    """
    Retrieve AI analysis for a specific lap.
    
    Args:
        lap_number: Lap number
    
    Returns:
        Analysis document or None
    """
    analysis = analysis_collection.find_one({"lap_number": lap_number})
    
    if analysis:
        analysis['_id'] = str(analysis['_id'])
        # Remove MongoDB-specific fields if not needed
        analysis.pop('created_at', None)
    
    return analysis


def get_all_laps(skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Get all lap summaries with telemetry data.
    
    Args:
        skip: Number of documents to skip
        limit: Maximum number of documents to return
    
    Returns:
        List of lap summaries with telemetry fields
    """
    # First, try to get from lap_summaries collection
    cursor = lap_summary_collection.find().sort("lap_number", 1).skip(skip).limit(limit)
    laps = list(cursor)
    
    # If no summaries exist, generate from analysis collection
    if not laps:
        cursor = analysis_collection.find().sort("lap_number", 1).skip(skip).limit(limit)
        laps = []
        for doc in cursor:
            laps.append({
                "lap_number": doc.get("lap_number"),
                "lap_time": doc.get("lap_time"),
                "data_points": telemetry_collection.count_documents({"lap_number": doc.get("lap_number")})
            })
    
    # Enrich each lap with telemetry data for display
    enriched_laps = []
    for lap in laps:
        lap_number = lap.get("lap_number")
        
        # Get first telemetry data point for this lap
        telemetry_point = telemetry_collection.find_one({"lap_number": lap_number})
        
        if telemetry_point:
            # Add telemetry fields to lap
            lap["speed"] = telemetry_point.get("speed", 0)
            lap["throttle"] = telemetry_point.get("throttle", 0)
            lap["brake"] = telemetry_point.get("brake", 0)
            lap["gear"] = telemetry_point.get("gear", 0)
            lap["rpm"] = telemetry_point.get("rpm", 0)
            lap["id"] = str(telemetry_point.get("_id", ""))
        else:
            # Fallback values if no telemetry data
            lap["speed"] = 0
            lap["throttle"] = 0
            lap["brake"] = 0
            lap["gear"] = 0
            lap["rpm"] = 0
            lap["id"] = str(lap.get("_id", ""))
        
        enriched_laps.append(lap)
    
    # Convert ObjectIds to strings
    for lap in enriched_laps:
        if '_id' in lap:
            lap['_id'] = str(lap['_id'])
    
    return enriched_laps


def create_lap_summary(lap_number: int, lap_time: float = None) -> str:
    """
    Create or update a lap summary.
    
    Args:
        lap_number: Lap number
        lap_time: Lap time in seconds
    
    Returns:
        Document ID
    """
    data_points_count = telemetry_collection.count_documents({"lap_number": lap_number})
    
    summary = {
        "lap_number": lap_number,
        "lap_time": lap_time,
        "data_points": data_points_count,
        "created_at": datetime.utcnow()
    }
    
    result = lap_summary_collection.update_one(
        {"lap_number": lap_number},
        {"$set": summary},
        upsert=True
    )
    
    if result.upserted_id:
        return str(result.upserted_id)
    else:
        doc = lap_summary_collection.find_one({"lap_number": lap_number})
        return str(doc['_id'])


def delete_lap(lap_number: int) -> bool:
    """
    Delete all data for a specific lap.
    
    Args:
        lap_number: Lap number to delete
    
    Returns:
        True if successful
    """
    telemetry_collection.delete_many({"lap_number": lap_number})
    analysis_collection.delete_one({"lap_number": lap_number})
    lap_summary_collection.delete_one({"lap_number": lap_number})
    
    return True


def get_lap_count() -> int:
    """
    Get total number of laps in database.
    
    Returns:
        Count of unique laps
    """
    return lap_summary_collection.count_documents({})
