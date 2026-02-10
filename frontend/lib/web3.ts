// Sepolia Ethereum Testnet Configuration
import { defineChain } from 'viem'

export const sepolia = defineChain({
    id: 11_155_111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.sepolia.org'] },
        public: { http: ['https://rpc.sepolia.org'] },
    },
    blockExplorers: {
        default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
    testnet: true,
})

// Smart Contract Configuration
export const F1_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// Contract ABI (read-only functions for frontend)
export const F1_CONTRACT_ABI = [
    {
        "inputs": [{ "internalType": "uint256", "name": "_lapNumber", "type": "uint256" }],
        "name": "getLap",
        "outputs": [{
            "components": [
                { "internalType": "uint256", "name": "lapNumber", "type": "uint256" },
                { "internalType": "uint256", "name": "lapTime", "type": "uint256" },
                { "internalType": "string", "name": "ipfsHash", "type": "string" },
                { "internalType": "uint8", "name": "performanceScore", "type": "uint8" },
                { "internalType": "uint256[3]", "name": "sectorTimes", "type": "uint256[3]" },
                { "internalType": "address", "name": "recorder", "type": "address" },
                { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                { "internalType": "bool", "name": "exists", "type": "bool" }
            ],
            "internalType": "struct F1TelemetryRegistry.LapRecord",
            "name": "",
            "type": "tuple"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_count", "type": "uint256" }],
        "name": "getLeaderboard",
        "outputs": [{
            "components": [
                { "internalType": "uint256", "name": "lapNumber", "type": "uint256" },
                { "internalType": "uint256", "name": "lapTime", "type": "uint256" },
                { "internalType": "string", "name": "ipfsHash", "type": "string" },
                { "internalType": "uint8", "name": "performanceScore", "type": "uint8" },
                { "internalType": "uint256[3]", "name": "sectorTimes", "type": "uint256[3]" },
                { "internalType": "address", "name": "recorder", "type": "address" },
                { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                { "internalType": "bool", "name": "exists", "type": "bool" }
            ],
            "internalType": "struct F1TelemetryRegistry.LapRecord[]",
            "name": "",
            "type": "tuple[]"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalLaps",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

// Supported chains
export const SUPPORTED_CHAINS = [sepolia];

// Helper functions
export function formatLapTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.floor(milliseconds % 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export function shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getEtherscanUrl(txHash: string, type: 'tx' | 'address' = 'tx'): string {
    return `https://sepolia.etherscan.io/${type}/${txHash}`;
}

export function getIPFSGatewayUrl(ipfsHash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}
