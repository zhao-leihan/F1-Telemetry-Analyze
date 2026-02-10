/**
 * Blockchain Verification Component
 * 
 * Shows blockchain verification status for lap records
 */

'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { F1_CONTRACT_ADDRESS, F1_CONTRACT_ABI, formatLapTime, getEtherscanUrl, getIPFSGatewayUrl } from '../lib/web3';

interface BlockchainVerificationProps {
    lapNumber: number;
}

export default function BlockchainVerification({ lapNumber }: BlockchainVerificationProps) {
    const { isConnected } = useAccount();
    const [showDetails, setShowDetails] = useState(false);

    // Read lap data from blockchain
    const { data: lapData, isError, isLoading } = useReadContract({
        address: F1_CONTRACT_ADDRESS as `0x${string}`,
        abi: F1_CONTRACT_ABI,
        functionName: 'getLap',
        args: [BigInt(lapNumber)],
    });

    // Type guard and exists check
    const lapRecord = lapData as any;
    const lapExists = lapRecord && lapRecord[7]; // exists field

    if (isLoading) {
        return (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-gray-400">Verifying on blockchain...</span>
                </div>
            </div>
        );
    }

    if (isError || !lapExists) {
        return (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-400">⚠️ Not verified on blockchain</span>
                    <span className="text-xs text-gray-500">(Data in PostgreSQL cache only)</span>
                </div>
            </div>
        );
    }

    const [lapNum, lapTimeMs, ipfsHash, performanceScore, sectorTimes, recorder, timestamp] = lapRecord;

    return (
        <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg p-4 border border-green-500/30">
            {/* Verification Badge */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <span className="text-green-400 text-lg">✓</span>
                    <span className="text-green-400 font-semibold">Blockchain Verified</span>
                    <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs">
                        Sepolia Testnet
                    </span>
                </div>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
            </div>

            {/* Details */}
            {showDetails && (
                <div className="space-y-2 mt-3 border-t border-gray-700 pt-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-400">Lap Time:</span>
                            <span className="text-white ml-2">{formatLapTime(Number(lapTimeMs))}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Performance Score:</span>
                            <span className="text-white ml-2">{performanceScore}/100</span>
                        </div>
                    </div>

                    <div className="text-sm">
                        <span className="text-gray-400">Sector Times:</span>
                        <div className="text-white ml-2">
                            S1: {formatLapTime(Number(sectorTimes[0]))} |
                            S2: {formatLapTime(Number(sectorTimes[1]))} |
                            S3: {formatLapTime(Number(sectorTimes[2]))}
                        </div>
                    </div>

                    <div className="text-sm">
                        <span className="text-gray-400">Recorded By:</span>
                        <span className="text-white ml-2 font-mono text-xs">
                            {recorder.slice(0, 6)}...{recorder.slice(-4)}
                        </span>
                    </div>

                    <div className="text-sm">
                        <span className="text-gray-400">Timestamp:</span>
                        <span className="text-white ml-2">
                            {new Date(Number(timestamp) * 1000).toLocaleString()}
                        </span>
                    </div>

                    {/* Links */}
                    <div className="flex space-x-3 mt-3">
                        <a
                            href={getIPFSGatewayUrl(ipfsHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                        >
                            <span>📁</span>
                            <span>View on IPFS</span>
                        </a>
                        <a
                            href={getEtherscanUrl(F1_CONTRACT_ADDRESS, 'address')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                        >
                            <span>🔗</span>
                            <span>View Contract</span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
