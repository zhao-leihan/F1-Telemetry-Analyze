"""
IPFS client for uploading and retrieving F1 telemetry data.

Uses Pinata (https://pinata.cloud/) for free IPFS pinning service.
Free tier: 1GB storage, plenty for telemetry data.
"""

import os
import json
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# Pinata API credentials from environment
PINATA_API_KEY = os.getenv("PINATA_API_KEY", "")
PINATA_SECRET_KEY = os.getenv("PINATA_SECRET_KEY", "")
PINATA_JWT = os.getenv("PINATA_JWT", "")  # Optional: newer auth method

# Pinata API endpoints
PINATA_PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
PINATA_PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"
PINATA_UNPIN_URL = "https://api.pinata.cloud/pinning/unpin/"

# IPFS gateway for retrieving data
IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/"


class IPFSClient:
    """
    Client for interacting with IPFS via Pinata service.
    
    Handles uploading telemetry data and retrieving it via IPFS hash.
    """
    
    def __init__(self):
        """Initialize IPFS client with Pinata credentials."""
        self.headers = {
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_SECRET_KEY
        }
        
        # Use JWT if available (newer auth method)
        if PINATA_JWT:
            self.headers = {
                "Authorization": f"Bearer {PINATA_JWT}"
            }
    
    def upload_telemetry(self, lap_data: Dict[str, Any], lap_number: int) -> str:
        """
        Upload telemetry data to IPFS via Pinata.
        
        Args:
            lap_data: Complete lap telemetry and analysis data
            lap_number: Lap number for metadata
        
        Returns:
            IPFS hash (CID) of uploaded data
        
        Example:
            >>> client = IPFSClient()
            >>> ipfs_hash = client.upload_telemetry(lap_data, 12)
            >>> print(ipfs_hash)
            'QmXxxx...'
        """
        # Prepare metadata for Pinata
        metadata = {
            "name": f"F1_Lap_{lap_number}_Telemetry",
            "keyvalues": {
                "lap_number": str(lap_number),
                "type": "telemetry",
                "app": "F1_Telemetry_Analyzer"
            }
        }
        
        # Prepare request body
        body = {
            "pinataContent": lap_data,
            "pinataMetadata": metadata,
            "pinataOptions": {
                "cidVersion": 1
            }
        }
        
        try:
            response = requests.post(
                PINATA_PIN_JSON_URL,
                json=body,
                headers=self.headers
            )
            response.raise_for_status()
            
            result = response.json()
            ipfs_hash = result["IpfsHash"]
            
            print(f"✅ Uploaded to IPFS: {ipfs_hash}")
            print(f"🔗 Gateway URL: {self.get_gateway_url(ipfs_hash)}")
            
            return ipfs_hash
            
        except requests.exceptions.RequestException as e:
            print(f"❌ IPFS upload failed: {str(e)}")
            raise Exception(f"Failed to upload to IPFS: {str(e)}")
    
    def retrieve_telemetry(self, ipfs_hash: str) -> Dict[str, Any]:
        """
        Retrieve telemetry data from IPFS.
        
        Args:
            ipfs_hash: IPFS hash (CID) of the data
        
        Returns:
            Telemetry data as dictionary
        
        Example:
            >>> client = IPFSClient()
            >>> data = client.retrieve_telemetry("QmXxxx...")
            >>> print(data['lap_number'])
            12
        """
        url = self.get_gateway_url(ipfs_hash)
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            print(f"✅ Retrieved from IPFS: {ipfs_hash}")
            
            return data
            
        except requests.exceptions.RequestException as e:
            print(f"❌ IPFS retrieval failed: {str(e)}")
            raise Exception(f"Failed to retrieve from IPFS: {str(e)}")
    
    def get_gateway_url(self, ipfs_hash: str) -> str:
        """
        Get public gateway URL for IPFS hash.
        
        Args:
            ipfs_hash: IPFS hash (CID)
        
        Returns:
            Full gateway URL
        """
        return f"{IPFS_GATEWAY}{ipfs_hash}"
    
    def verify_hash(self, ipfs_hash: str) -> bool:
        """
        Verify that IPFS hash is accessible.
        
        Args:
            ipfs_hash: IPFS hash to verify
        
        Returns:
            True if accessible, False otherwise
        """
        try:
            url = self.get_gateway_url(ipfs_hash)
            response = requests.head(url, timeout=10)
            return response.status_code == 200
        except:
            return False
    
    def unpin(self, ipfs_hash: str) -> bool:
        """
        Unpin data from Pinata (free up storage).
        
        Only use if you want to permanently remove data.
        
        Args:
            ipfs_hash: IPFS hash to unpin
        
        Returns:
            True if successfully unpinned
        """
        url = f"{PINATA_UNPIN_URL}{ipfs_hash}"
        
        try:
            response = requests.delete(url, headers=self.headers)
            response.raise_for_status()
            print(f"✅ Unpinned from IPFS: {ipfs_hash}")
            return True
        except requests.exceptions.RequestException as e:
            print(f"❌ Unpin failed: {str(e)}")
            return False


# Convenience functions for direct use
def upload_to_ipfs(lap_data: Dict[str, Any], lap_number: int) -> str:
    """Upload lap data to IPFS and return hash."""
    client = IPFSClient()
    return client.upload_telemetry(lap_data, lap_number)


def retrieve_from_ipfs(ipfs_hash: str) -> Dict[str, Any]:
    """Retrieve lap data from IPFS by hash."""
    client = IPFSClient()
    return client.retrieve_telemetry(ipfs_hash)


def get_ipfs_url(ipfs_hash: str) -> str:
    """Get public IPFS gateway URL."""
    client = IPFSClient()
    return client.get_gateway_url(ipfs_hash)


if __name__ == "__main__":
    # Test IPFS client
    print("🧪 Testing IPFS Client...\n")
    
    # Check credentials
    if not PINATA_API_KEY and not PINATA_JWT:
        print("❌ No Pinata credentials found!")
        print("Set PINATA_API_KEY and PINATA_SECRET_KEY in .env file")
        print("Get free API keys from: https://www.pinata.cloud/\n")
        exit(1)
    
    # Test upload
    test_data = {
        "lap_number": 99,
        "lap_time": 88.456,
        "test": True,
        "message": "F1 Telemetry Test"
    }
    
    try:
        client = IPFSClient()
        ipfs_hash = client.upload_telemetry(test_data, 99)
        
        print(f"\n📤 Upload successful!")
        print(f"IPFS Hash: {ipfs_hash}")
        print(f"Gateway URL: {client.get_gateway_url(ipfs_hash)}")
        
        # Test retrieval
        print(f"\n📥 Testing retrieval...")
        retrieved = client.retrieve_telemetry(ipfs_hash)
        print(f"Retrieved data: {retrieved}")
        
        # Verify
        if retrieved == test_data:
            print("\n✅ IPFS test passed! Data matches.")
        else:
            print("\n⚠️  Warning: Retrieved data doesn't match uploaded data")
        
        # Clean up (optional)
        # client.unpin(ipfs_hash)
        
    except Exception as e:
        print(f"\n❌ IPFS test failed: {str(e)}")
