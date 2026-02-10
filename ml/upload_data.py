"""
Upload sample telemetry data to the backend API.

This script generates sample data and uploads it to the running API.
Useful for populating the database with test data.
"""

import requests
import json
from data_generator import generate_session_data

API_URL = "http://localhost:8000"


def upload_telemetry_batch(data_points, batch_size=100):
    """
    Upload telemetry data in batches.
    
    Args:
        data_points: List of telemetry data dictionaries
        batch_size: Number of points per batch
    """
    # Group by lap
    laps = {}
    for point in data_points:
        lap_num = point['lap_number']
        if lap_num not in laps:
            laps[lap_num] = []
        laps[lap_num].append(point)
    
    print(f"📤 Uploading {len(laps)} laps to {API_URL}")
    
    for lap_num, lap_points in laps.items():
        try:
            response = requests.post(
                f"{API_URL}/telemetry/upload",
                json={"data_points": lap_points},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                print(f"  ✓ Lap {lap_num:2d}: {len(lap_points):4d} points uploaded")
            else:
                print(f"  ✗ Lap {lap_num:2d}: Failed ({response.status_code})")
                print(f"    Error: {response.text}")
        except Exception as e:
            print(f"  ✗ Lap {lap_num:2d}: Error - {str(e)}")
    
    print("\n✅ Upload complete!")


def main():
    print("=" * 60)
    print("F1 TELEMETRY DATA UPLOADER")
    print("=" * 60)
    
    # Check if API is running
    try:
        health = requests.get(f"{API_URL}/health")
        if health.status_code == 200:
            print(f"✓ Backend API is online at {API_URL}\n")
        else:
            print(f"✗ Backend API returned error: {health.status_code}")
            return
    except Exception as e:
        print(f"✗ Cannot connect to backend API at {API_URL}")
        print(f"  Make sure the backend is running (uvicorn main:app)")
        print(f"  Error: {str(e)}")
        return
    
    # Generate sample data
    print("🏎️  Generating sample telemetry data...\n")
    data = generate_session_data(num_laps=20, output_file=None)
    
    # Upload data
    upload_telemetry_batch(data)
    
    print("\n" + "=" * 60)
    print("Data is now available in the dashboard!")
    print(f"Open http://localhost:3000 to view the telemetry analyzer")
    print("=" * 60)


if __name__ == "__main__":
    main()
