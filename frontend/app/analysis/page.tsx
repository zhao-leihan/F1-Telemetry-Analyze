/**
 * Analysis Page - Telemetry Data Visualization
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LapData {
    lap_number: number;
    speed: number;
    throttle: number;
    brake: number;
    gear: number;
    rpm: number;
}

export default function AnalysisPage() {
    const searchParams = useSearchParams();
    const lapNumber = searchParams.get('lap');

    const [laps, setLaps] = useState<LapData[]>([]);
    const [selectedLap, setSelectedLap] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLaps();
    }, []);

    useEffect(() => {
        if (lapNumber) {
            setSelectedLap(parseInt(lapNumber));
        }
    }, [lapNumber]);

    const fetchLaps = async () => {
        try {
            const response = await fetch('http://localhost:8000/telemetry/laps');
            const data = await response.json();

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

    const filteredData = selectedLap
        ? laps.filter(lap => lap.lap_number === selectedLap)
        : laps;

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
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-2 h-16 bg-f1-red-bright"></div>
                        <div>
                            <h1 className="text-5xl font-racing font-bold text-white">
                                TELEMETRY ANALYSIS
                            </h1>
                            <p className="text-f1-silver font-tech mt-2">
                                {selectedLap ? `Analyzing Lap ${selectedLap}` : 'All laps overview'}
                            </p>
                        </div>
                    </div>

                    {/* Lap Selector */}
                    <div className="glass-red border border-f1-red/30 rounded-lg p-6 mb-6">
                        <label className="block text-f1-silver font-tech text-sm uppercase mb-3">
                            Select Lap
                        </label>
                        <select
                            value={selectedLap || ''}
                            onChange={(e) => setSelectedLap(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full md:w-64 bg-black/40 border border-f1-red/30 rounded px-4 py-3 text-white font-racing text-lg focus:outline-none focus:border-f1-red"
                        >
                            <option value="">All Laps</option>
                            {laps.map((lap) => (
                                <option key={lap.lap_number} value={lap.lap_number}>
                                    Lap {lap.lap_number}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Charts */}
                    {isLoading ? (
                        <div className="glass-red border border-f1-red/30 rounded-lg p-12 text-center">
                            <div className="inline-block w-12 h-12 border-4 border-f1-red border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-white font-racing text-xl">Loading data...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="glass-red border border-f1-red/30 rounded-lg p-12 text-center">
                            <p className="text-white font-racing text-2xl mb-4">No data available</p>
                            <p className="text-f1-silver font-tech">Add lap data to see analysis</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Speed Chart */}
                            <div className="bg-white/95 backdrop-blur-sm border-2 border-f1-red/20 rounded-lg p-6 shadow-2xl">
                                <h2 className="text-2xl font-racing text-f1-red mb-4">SPEED ANALYSIS</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={filteredData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                        <XAxis
                                            dataKey="lap_number"
                                            stroke="#cccccc"
                                            label={{ value: 'Lap Number', position: 'insideBottom', offset: -5, fill: '#cccccc' }}
                                        />
                                        <YAxis
                                            stroke="#cccccc"
                                            label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', fill: '#cccccc' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a0505', border: '1px solid #E10600' }}
                                            labelStyle={{ color: '#ffffff' }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="speed" stroke="#E10600" strokeWidth={3} name="Speed" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Throttle & Brake Chart */}
                            <div className="bg-white/95 backdrop-blur-sm border-2 border-f1-red/20 rounded-lg p-6 shadow-2xl">
                                <h2 className="text-2xl font-racing text-f1-red mb-4">THROTTLE & BRAKE</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={filteredData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                        <XAxis
                                            dataKey="lap_number"
                                            stroke="#cccccc"
                                            label={{ value: 'Lap Number', position: 'insideBottom', offset: -5, fill: '#cccccc' }}
                                        />
                                        <YAxis
                                            stroke="#cccccc"
                                            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#cccccc' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a0505', border: '1px solid #E10600' }}
                                            labelStyle={{ color: '#ffffff' }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="throttle" stroke="#00ff00" strokeWidth={2} name="Throttle" />
                                        <Line type="monotone" dataKey="brake" stroke="#ff0000" strokeWidth={2} name="Brake" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* RPM Chart */}
                            <div className="bg-white/95 backdrop-blur-sm border-2 border-f1-red/20 rounded-lg p-6 shadow-2xl">
                                <h2 className="text-2xl font-racing text-f1-red mb-4">ENGINE RPM</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={filteredData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                        <XAxis
                                            dataKey="lap_number"
                                            stroke="#cccccc"
                                            label={{ value: 'Lap Number', position: 'insideBottom', offset: -5, fill: '#cccccc' }}
                                        />
                                        <YAxis
                                            stroke="#cccccc"
                                            label={{ value: 'RPM', angle: -90, position: 'insideLeft', fill: '#cccccc' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a0505', border: '1px solid #E10600' }}
                                            labelStyle={{ color: '#ffffff' }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="rpm" stroke="#FFA500" strokeWidth={3} name="RPM" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
