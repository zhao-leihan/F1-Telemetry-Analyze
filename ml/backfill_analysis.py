"""
Backfill lap analysis for existing telemetry data.

This script generates analysis for laps that already have telemetry data
but no analysis in Firebase (needed after migration or manual uploads).
"""

import requests
import sys

API_BASE = "http://localhost:8000"

def backfill_analyses():
    """Generate analysis for all laps with telemetry but no analysis."""
    print("🔄 Backfilling lap analyses...")
    
    # Get list of laps (currently returns empty because no analysis exists yet)
    response = requests.get(f"{API_BASE}/telemetry/laps")
    laps_with_analysis = set(lap.get('lap_number') for lap in response.json().get('laps', []))
    
    print(f"✓ Found {len(laps_with_analysis)} laps with existing analysis")
    
    # Try to generate analysis for lap numbers 1-20 (from recent upload)
    print("\n🔄 Generating missing analyses...")
    success_count = 0
    
    for lap_num in range(1, 21):
        if lap_num in laps_with_analysis:
            print(f"  ⏭️  Lap {lap_num}: Analysis already exists")
            continue
        
        try:
            # Get analysis endpoint automatically generates if missing
            response = requests.get(f"{API_BASE}/telemetry/analysis/{lap_num}")
            
            if response.status_code == 200:
                print(f"  ✅ Lap {lap_num}: Analysis generated successfully")
                success_count += 1
            elif response.status_code == 404:
                print(f"  ⏭️  Lap {lap_num}: No telemetry data found")
            else:
                print(f"  ❌ Lap {lap_num}: Failed ({response.status_code})")
        
        except Exception as e:
            print(f"  ❌ Lap {lap_num}: Error - {e}")
    
    print(f"\n✅ Backfill complete! Generated {success_count} new analyses")
    print(f"🌐 Open http://localhost:3000 to see your telemetry data!")

if __name__ == "__main__":
    try:
        # Check if backend is running
        response = requests.get(f"{API_BASE}/health")
        print(f"✓ Backend is online at {API_BASE}\n")
    except:
        print(f"❌ Backend is not running at {API_BASE}")
        print("Please start the backend first: uvicorn main:app --reload")
        sys.exit(1)
    
    backfill_analyses()
