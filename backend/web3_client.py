"""
Web3 client for interacting with F1TelemetryRegistry smart contract on Sepolia Ethereum.

Uses Alchemy RPC endpoint for reliable blockchain access.
Free tier: 300M compute units/month, plenty for telemetry uploads.
"""

import os
import json
from typing import Dict, Any, List, Optional
from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv

load_dotenv()

# Blockchain configuration - Sepolia Ethereum Testnet
ALCHEMY_RPC_URL = os.getenv("ALCHEMY_RPC_URL", "https://eth-sepolia.g.alchemy.com/v2/0DlqzIeoBaWzSYBxAMrnm")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "")
WALLET_PRIVATE_KEY = os.getenv("WALLET_PRIVATE_KEY", "")

# Contract ABI (Application Binary Interface)
# Generated from Hardhat compilation
CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "lapNumber", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "lapTime", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "recorder", "type": "address"}
        ],
        "name": "NewFastestLap",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "lapNumber", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "lapTime", "type": "uint256"},
            {"indexed": False, "internalType": "string", "name": "ipfsHash", "type": "string"},
            {"indexed": False, "internalType": "uint8", "name": "performanceScore", "type": "uint8"},
            {"indexed": True, "internalType": "address", "name": "recorder", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "LapRecorded",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_lapNumber", "type": "uint256"},
            {"internalType": "uint256", "name": "_lapTime", "type": "uint256"},
            {"internalType": "string", "name": "_ipfsHash", "type": "string"},
            {"internalType": "uint8", "name": "_performanceScore", "type": "uint8"},
            {"internalType": "uint256[3]", "name": "_sectorTimes", "type": "uint256[3]"}
        ],
        "name": "recordLap",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_lapNumber", "type": "uint256"}],
        "name": "getLap",
        "outputs": [
            {
                "components": [
                    {"internalType": "uint256", "name": "lapNumber", "type": "uint256"},
                    {"internalType": "uint256", "name": "lapTime", "type": "uint256"},
                    {"internalType": "string", "name": "ipfsHash", "type": "string"},
                    {"internalType": "uint8", "name": "performanceScore", "type": "uint8"},
                    {"internalType": "uint256[3]", "name": "sectorTimes", "type": "uint256[3]"},
                    {"internalType": "address", "name": "recorder", "type": "address"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                    {"internalType": "bool", "name": "exists", "type": "bool"}
                ],
                "internalType": "struct F1TelemetryRegistry.LapRecord",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_count", "type": "uint256"}],
        "name": "getLeaderboard",
        "outputs": [
            {
                "components": [
                    {"internalType": "uint256", "name": "lapNumber", "type": "uint256"},
                    {"internalType": "uint256", "name": "lapTime", "type": "uint256"},
                    {"internalType": "string", "name": "ipfsHash", "type": "string"},
                    {"internalType": "uint8", "name": "performanceScore", "type": "uint8"},
                    {"internalType": "uint256[3]", "name": "sectorTimes", "type": "uint256[3]"},
                    {"internalType": "address", "name": "recorder", "type": "address"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                    {"internalType": "bool", "name": "exists", "type": "bool"}
                ],
                "internalType": "struct F1TelemetryRegistry.LapRecord[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllLapNumbers",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getFastestLapTime",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalLaps",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_lapNumber", "type": "uint256"}],
        "name": "lapRecordExists",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }
]


class Web3Client:
    """
    Client for interacting with F1TelemetryRegistry smart contract.
    
    Handles blockchain transactions and queries on Sepolia Ethereum testnet.
    """
    
    def __init__(self):
        """Initialize Web3 client with Alchemy RPC."""
        self.w3 = Web3(Web3.HTTPProvider(ALCHEMY_RPC_URL))
        
        # Sepolia doesn't need PoA middleware (only for Polygon/BSC)
        # self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        # Check connection
        if not self.w3.is_connected():
            raise Exception("Failed to connect to Sepolia Ethereum")
        
        print(f"✅ Connected to Sepolia Ethereum (Chain ID: {self.w3.eth.chain_id})")
        
        # Load contract
        if not CONTRACT_ADDRESS:
            print("⚠️  Warning: CONTRACT_ADDRESS not set in .env")
            self.contract = None
        else:
            self.contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(CONTRACT_ADDRESS),
                abi=CONTRACT_ABI
            )
            print(f"📄 Contract loaded: {CONTRACT_ADDRESS}")
        
        # Load wallet
        if WALLET_PRIVATE_KEY:
            self.account = self.w3.eth.account.from_key(WALLET_PRIVATE_KEY)
            print(f"🔑 Wallet loaded: {self.account.address}")
        else:
            self.account = None
            print("⚠️  Warning: WALLET_PRIVATE_KEY not set")
    
    def record_lap_on_chain(
        self,
        lap_number: int,
        lap_time_ms: int,
        ipfs_hash: str,
        performance_score: int,
        sector_times_ms: List[int]
    ) -> str:
        """
        Record lap on blockchain.
        
        Args:
            lap_number: Sequential lap number
            lap_time_ms: Lap time in milliseconds
            ipfs_hash: IPFS hash containing full telemetry
            performance_score: AI performance score (0-100)
            sector_times_ms: List of 3 sector times in milliseconds
        
        Returns:
            Transaction hash
        
        Example:
            >>> client = Web3Client()
            >>> tx_hash = client.record_lap_on_chain(
            ...     lap_number=1,
            ...     lap_time_ms=88456,
            ...     ipfs_hash="QmXxxx...",
            ...     performance_score=85,
            ...     sector_times_ms=[28000, 30000, 30456]
            ... )
        """
        if not self.contract or not self.account:
            raise Exception("Contract or wallet not initialized")
        
        # Build transaction
        tx = self.contract.functions.recordLap(
            lap_number,
            lap_time_ms,
            ipfs_hash,
            performance_score,
            sector_times_ms
        ).build_transaction({
            'from': self.account.address,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'gas': 500000,  # Gas limit
            'gasPrice': self.w3.eth.gas_price
        })
        
        # Sign transaction
        signed_tx = self.account.sign_transaction(tx)
        
        # Send transaction
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        print(f"📤 Transaction sent: {tx_hash.hex()}")
        print(f"🔗 View on Etherscan: https://sepolia.etherscan.io/tx/{tx_hash.hex()}")
        
        # Wait for confirmation
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        if receipt['status'] == 1:
            print(f"✅ Lap {lap_number} recorded on-chain!")
        else:
            # Get revert reason if available
            try:
                # Try to replay transaction to get revert reason
                self.w3.eth.call(tx, receipt['blockNumber'])
            except Exception as revert_error:
                revert_reason = str(revert_error)
                print(f"❌ Transaction reverted: {revert_reason}")
                raise Exception(f"Transaction failed - Revert reason: {revert_reason}")
            
            print(f"❌ Transaction failed with status 0")
            raise Exception("Transaction failed - check Etherscan for details")
        
        return tx_hash.hex()
    
    def get_lap_from_chain(self, lap_number: int) -> Dict[str, Any]:
        """
        Retrieve lap record from blockchain.
        
        Args:
            lap_number: Lap number to retrieve
        
        Returns:
            Lap record dictionary
        """
        if not self.contract:
            raise Exception("Contract not initialized")
        
        lap = self.contract.functions.getLap(lap_number).call()
        
        return {
            "lap_number": lap[0],
            "lap_time_ms": lap[1],
            "ipfs_hash": lap[2],
            "performance_score": lap[3],
            "sector_times_ms": list(lap[4]),
            "recorder": lap[5],
            "timestamp": lap[6],
            "exists": lap[7]
        }
    
    def get_leaderboard(self, count: int = 10) -> List[Dict[str, Any]]:
        """
        Get top fastest laps from blockchain.
        
        Args:
            count: Number of laps to retrieve (max 50)
        
        Returns:
            List of lap records
        """
        if not self.contract:
            raise Exception("Contract not initialized")
        
        laps = self.contract.functions.getLeaderboard(count).call()
        
        result = []
        for lap in laps:
            result.append({
                "lap_number": lap[0],
                "lap_time_ms": lap[1],
                "ipfs_hash": lap[2],
                "performance_score": lap[3],
                "sector_times_ms": list(lap[4]),
                "recorder": lap[5],
                "timestamp": lap[6],
                "exists": lap[7]
            })
        
        return result
    
    def get_total_laps(self) -> int:
        """Get total number of laps recorded on-chain."""
        if not self.contract:
            raise Exception("Contract not initialized")
        
        return self.contract.functions.totalLaps().call()
    
    def get_fastest_lap_time(self) -> int:
        """Get fastest lap time in milliseconds."""
        if not self.contract:
            raise Exception("Contract not initialized")
        
        return self.contract.functions.getFastestLapTime().call()
    
    def lap_exists_on_chain(self, lap_number: int) -> bool:
        """Check if lap exists on blockchain."""
        if not self.contract:
            raise Exception("Contract not initialized")
        
        return self.contract.functions.lapRecordExists(lap_number).call()


# Convenience functions
def record_lap_blockchain(
    lap_number: int,
    lap_time_ms: int,
    ipfs_hash: str,
    performance_score: int,
    sector_times_ms: List[int]
) -> str:
    """Record lap on blockchain."""
    client = Web3Client()
    return client.record_lap_on_chain(
        lap_number, lap_time_ms, ipfs_hash, performance_score, sector_times_ms
    )


def get_lap_blockchain(lap_number: int) -> Dict[str, Any]:
    """Get lap from blockchain."""
    client = Web3Client()
    return client.get_lap_from_chain(lap_number)


if __name__ == "__main__":
    # Test Web3 client
    print("🧪 Testing Web3 Client...\n")
    
    try:
        client = Web3Client()
        
        # Get total laps
        total = client.get_total_laps()
        print(f"\n📊 Total laps on-chain: {total}")
        
        if total > 0:
            # Get fastest lap
            fastest = client.get_fastest_lap_time()
            print(f"⚡ Fastest lap: {fastest} ms ({fastest/1000:.3f}s)")
            
            # Get leaderboard
            leaderboard = client.get_leaderboard(5)
            print(f"\n🏆 Top 5 Leaderboard:")
            for i, lap in enumerate(leaderboard, 1):
                if lap['exists']:
                    print(f"{i}. Lap {lap['lap_number']}: {lap['lap_time_ms']/1000:.3f}s (Score: {lap['performance_score']})")
        else:
            print("\n📝 No laps recorded yet. Upload some telemetry first!")
        
    except Exception as e:
        print(f"\n❌ Web3 test failed: {str(e)}")
        print("\nMake sure to:")
        print("1. Deploy contract: cd contracts && npm run deploy:mumbai")
        print("2. Set CONTRACT_ADDRESS in .env")
        print("3. Set WALLET_PRIVATE_KEY in .env")
        print("4. Get test MATIC from: https://faucet.polygon.technology/")
