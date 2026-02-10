/**
 * Laps Data Page - List of all recorded laps
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface LapData {
    id?: string;
    lap_number: number;
    speed: number;
    throttle: number;
    brake: number;
    gear: number;
    rpm: number;
    timestamp?: string;
}

export default function LapsPage() {
    const router = useRouter();
    const [laps, setLaps] = useState<LapData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLaps();
    }, []);

    const fetchLaps = async () => {
        try {
            const response = await fetch('http://localhost:8000/telemetry/laps');
            const data = await response.json();
            console.log('📊 Fetched laps:', data);

            // Handle different response structures
            if (data.laps) {
                setLaps(data.laps);
            } else if (Array.isArray(data)) {
                setLaps(data);
            } else {
                setLaps([]);
            }
        } catch (error) {
            console.error('❌ Error fetching laps:', error);
            setLaps([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this lap?')) return;

        try {
            const response = await fetch(`http://localhost:8000/telemetry/laps/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log('✅ Lap deleted');
                fetchLaps();
            } else {
                console.error('❌ Failed to delete');
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0202]">
            {/* Professional Dark Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0202] to-[#1a0505]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a0808]/40 via-transparent to-transparent"></div>
                <img src="/images/bg.jpg" alt="Background" className="w-full h-full object-cover opacity-10 filter grayscale mix-blend-overlay" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-24 relative z-10">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-16 bg-f1-red-bright"></div>
                            <div>
                                <h1 className="text-5xl font-racing font-bold text-white">
                                    LAPS DATA
                                </h1>
                                <p className="text-f1-silver font-tech mt-2">
                                    {laps.length} laps recorded
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/input')}
                            className="btn-red-glow px-8 py-4 text-white rounded-lg font-racing shadow-neon-red hover-scale uppercase tracking-wider"
                        >
                            + ADD LAP
                        </button>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="glass-red border border-f1-red/30 rounded-lg p-12 text-center">
                            <div className="inline-block w-12 h-12 border-4 border-f1-red border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-white font-racing text-xl">Loading laps...</p>
                        </div>
                    ) : laps.length === 0 ? (
                        <div className="glass-red border border-f1-red/30 rounded-lg p-12 text-center">
                            <p className="text-white font-racing text-2xl mb-4">No laps recorded yet</p>
                            <p className="text-f1-silver font-tech mb-6">Add your first lap data to get started</p>
                            <button
                                onClick={() => router.push('/input')}
                                className="btn-red-glow px-8 py-4 text-white rounded-lg font-racing shadow-neon-red hover-scale uppercase tracking-wider"
                            >
                                ADD FIRST LAP
                            </button>
                        </div>
                    ) : (
                        <div className="relative bg-white/95 backdrop-blur-sm border-2 border-f1-red/20 rounded-lg overflow-hidden shadow-2xl">
                            {/* F1 Logo Background Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
                                <img
                                    src="/images/f1_logo.png"
                                    alt="F1 Logo"
                                    className="w-96 h-96 object-contain"
                                />
                            </div>

                            {/* Table Content */}
                            <div className="relative z-10">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-f1-red/30 bg-gradient-to-r from-f1-red/10 to-transparent">
                                            <th className="text-left px-6 py-4 text-f1-red font-tech uppercase text-sm font-bold">Lap #</th>
                                            <th className="text-left px-6 py-4 text-f1-red font-tech uppercase text-sm font-bold">Speed (km/h)</th>
                                            <th className="text-left px-6 py-4 text-f1-red font-tech uppercase text-sm font-bold">Throttle (%)</th>
                                            <th className="text-left px-6 py-4 text-f1-red font-tech uppercase text-sm font-bold">Brake (%)</th>
                                            <th className="text-left px-6 py-4 text-f1-red font-tech uppercase text-sm font-bold">Gear</th>
                                            <th className="text-left px-6 py-4 text-f1-red font-tech uppercase text-sm font-bold">RPM</th>
                                            <th className="text-left px-6 py-4 text-f1-red font-tech uppercase text-sm font-bold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {laps.map((lap, index) => (
                                            <tr
                                                key={lap.id || index}
                                                className="border-b border-gray-200 hover:bg-f1-red/5 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/analysis?lap=${lap.lap_number}`)}
                                            >
                                                <td className="px-6 py-4 text-gray-900 font-racing text-lg">{lap.lap_number}</td>
                                                <td className="px-6 py-4 text-gray-900 font-racing">{lap.speed?.toFixed(1) || '0.0'}</td>
                                                <td className="px-6 py-4 text-gray-900 font-racing">{lap.throttle?.toFixed(1) || '0.0'}</td>
                                                <td className="px-6 py-4 text-gray-900 font-racing">{lap.brake?.toFixed(1) || '0.0'}</td>
                                                <td className="px-6 py-4 text-gray-900 font-racing">{lap.gear || 0}</td>
                                                <td className="px-6 py-4 text-gray-900 font-racing">{lap.rpm || 0}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (lap.id) handleDelete(lap.id);
                                                        }}
                                                        className="text-red-600 hover:text-red-700 font-tech uppercase text-sm font-bold"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
