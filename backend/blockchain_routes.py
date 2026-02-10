"""
Blockchain-specific endpoints for F1 Telemetry Analyzer.

These endpoints provide blockchain-verified telemetry storage using:
- IPFS (Pinata) for decentralized data storage
- Sepolia for immutable lap records
"""

from fastapi import APIRouter, HTTPException
from typing import Optional

import schemas
from blockchain_service import BlockchainService
import crud

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])


@router.post("/upload", response_model=dict)
def upload_lap_blockchain(telemetry: schemas.TelemetryUpload):
    """
    Upload lap telemetry with blockchain verification.
    
    Process:
    1. Store telemetry in Firebase Firestore (cache)
    2. Upload full data to IPFS (Pinata)
    3. Record lap summary on Sepolia blockchain
    
    Returns transaction hash and IPFS URL for verification.
    """
    lap_number = telemetry.lap_number
    
    # Check if lap exists
    existing_lap = crud.get_lap_by_number(lap_number)
    if existing_lap:
        raise HTTPException(
            status_code=400,
            detail=f"Lap {lap_number} already exists. Use different lap number."
        )
    
    # Store in Firebase first
    telemetry_data = crud.bulk_create_telemetry(telemetry.data_points)
    
    # Get analysis
    analysis_result = crud.get_lap_analysis(lap_number)
    
    if not analysis_result:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis not found for lap {lap_number}"
        )
    
    # Prepare data for blockchain
    lap_data = {
        "lap_number": lap_number,
        "lap_time": telemetry.data_points[0].lap_time if telemetry.data_points else 0,
        "data_points": len(telemetry.data_points)
    }
    
    analysis_data = {
        "performance_score": analysis_result.get("performance_score", 0),
        "feedback": analysis_result.get("feedback", [])
    }
    
    # Upload to blockchain
    try:
        blockchain_service = BlockchainService()
        blockchain_result = blockchain_service.store_lap_blockchain(
            lap_number, lap_data, analysis_data
        )
        
        return {
            "message": f"Lap {lap_number} uploaded successfully",
            "lap_number": lap_number,
            "blockchain": blockchain_result,
            "verification_url": blockchain_result.get("explorer_url"),
            "ipfs_url": blockchain_result.get("ipfs_url")
        }
    
    except Exception as e:
        return {
            "message": f"Lap {lap_number} stored in Firebase (blockchain upload failed)",
            "lap_number": lap_number,
            "blockchain_verified": False,
            "error": str(e),
            "note": "Data is safely stored in Firebase. Retry blockchain upload later."
        }


@router.get("/lap/{lap_number}", response_model=dict)
def get_lap_blockchain(lap_number: int):
    """
    Retrieve lap from blockchain with full verification.
    
    Returns:
    - Blockchain record
    - IPFS data
    - Verification status
    """
    try:
        blockchain_service = BlockchainService()
        result = blockchain_service.retrieve_lap_blockchain(lap_number)
        
        if not result.get("verified"):
            # Fallback to Firebase
            db_lap = crud.get_lap_by_number(lap_number)
            if not db_lap:
                raise HTTPException(
                    status_code=404,
                    detail=f"Lap {lap_number} not found"
                )
            
            return {
                "lap_number": lap_number,
                "source": "firebase",
                "blockchain_verified": False,
                "data": db_lap,
                "note": "Retrieved from Firebase cache"
            }
        
        return {
            "lap_number": lap_number,
            "source": "blockchain",
            "blockchain_verified": True,
            "data": result
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve lap from blockchain: {str(e)}"
        )


@router.get("/leaderboard", response_model=dict)
def get_blockchain_leaderboard(count: int = 10):
    """
    Get top fastest laps from blockchain.
    
    Returns on-chain leaderboard with blockchain verification.
    """
    try:
        blockchain_service = BlockchainService()
        leaderboard = blockchain_service.get_blockchain_leaderboard(count)
        
        return {
            "count": len(leaderboard),
            "leaderboard": leaderboard,
            "source": "blockchain",
            "verified": True
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve leaderboard from blockchain: {str(e)}"
        )


@router.get("/stats", response_model=dict)
def get_blockchain_stats():
    """
    Get blockchain statistics.
    
    Returns:
    - Total laps on-chain
    - Fastest lap time
    - Contract address
    - Network info
    """
    try:
        blockchain_service = BlockchainService()
        
        total_laps = blockchain_service.web3.get_total_laps()
        fastest_time = blockchain_service.web3.get_fastest_lap_time()
        
        # Convert fastest time (returns max uint256 if no laps)
        if fastest_time == 2**256 - 1:
            fastest_time_display = None
        else:
            fastest_time_display = fastest_time / 1000  # ms to seconds
        
        return {
            "total_laps_on_chain": total_laps,
            "fastest_lap_time": fastest_time_display,
            "network": "Sepolia Testnet",
            "chain_id": 11155111,
            "contract_address": blockchain_service.web3.contract.address if blockchain_service.web3.contract else None,
            "explorer_url": f"https://sepolia.etherscan.io/address/{blockchain_service.web3.contract.address}" if blockchain_service.web3.contract else None
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get blockchain stats: {str(e)}"
        )
