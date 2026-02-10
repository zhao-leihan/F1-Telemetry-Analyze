'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/HeroSection';
import StatsCard from '@/components/StatsCard';
import TelemetryCharts from '@/components/TelemetryCharts';
import AIInsights from '@/components/AIInsights';
import { Flag, BarChart3, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LapData, TelemetryDataPoint } from '@/types/telemetry';

// Simplified interface for lap list items from API
interface LapSummaryItem {
    lap_number: number;
    lap_time?: number;
    speed?: number;
    throttle?: number;
    brake?: number;
    gear?: number;
    rpm?: number;
    created_at?: string;
    source?: string;
}

// Telemetry response from API
interface TelemetryResponse {
    data_points: TelemetryDataPoint[];
}

export default function DashboardPage() {
    const [laps, setLaps] = useState<LapSummaryItem[]>([]);
    const [selectedLap, setSelectedLap] = useState<number | null>(null);
    const [telemetryData, setTelemetryData] = useState<TelemetryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTelemetryLoading, setIsTelemetryLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLaps();
    }, []);

    useEffect(() => {
        if (selectedLap !== null) {
            fetchLapTelemetry(selectedLap);
        }
    }, [selectedLap]);

    const fetchLaps = async () => {
        try {
            const response = await fetch('http://localhost:8000/telemetry/laps');
            const data = await response.json();

            console.log('📊 Fetched laps:', data);

            if (data.laps && Array.isArray(data.laps)) {
                setLaps(data.laps);
                if (data.laps.length > 0 && selectedLap === null) {
                    setSelectedLap(data.laps[0].lap_number);
                }
            } else {
                setLaps([]);
            }
        } catch (err) {
            setError('Failed to fetch telemetry data');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLapTelemetry = async (lapNumber: number) => {
        setIsTelemetryLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/telemetry/lap/${lapNumber}`);
            if (response.ok) {
                const data = await response.json();
                console.log('📈 Telemetry data:', data);

                // Transform data to match TelemetryCharts expectations
                if (data.data_points && Array.isArray(data.data_points)) {
                    setTelemetryData({ data_points: data.data_points });
                } else {
                    setTelemetryData(null);
                }
            } else {
                console.error('Failed to load telemetry');
                setTelemetryData(null);
            }
        } catch (err) {
            console.error('Telemetry error:', err);
            setTelemetryData(null);
        } finally {
            setIsTelemetryLoading(false);
        }
    };

    const selectedLapData = laps.find(lap => lap.lap_number === selectedLap);

    return (
        <div className="min-h-screen bg-[#0a0202]">
            {/* SMOOTH PROFESSIONAL BACKGROUND - Multiple Layers */}
            <div className="absolute inset-0 z-0">
                {/* Base dark layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0202] to-[#1a0505]"></div>

                {/* Subtle red glow from bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a0808]/40 via-transparent to-transparent"></div>

                {/* Radial gradient for depth */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,2,2,0.8)_100%)]"></div>

                {/* Very subtle red accent - top right */}
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[#E10600]/10 via-transparent to-transparent blur-3xl"></div>

                {/* Background image overlay */}
                <img src="/images/bg.jpg" alt="Background" className="w-full h-full object-cover opacity-10 filter grayscale mix-blend-overlay" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-12 relative z-10">
                {/* Hero Section with Ferrari SF-24 */}
                <HeroSection />

                {/* Stats Overview */}
                <motion.section
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1 h-10 bg-f1-red"></div>
                        <h2 className="text-4xl font-racing font-bold text-white">
                            SYSTEM OVERVIEW
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatsCard value={laps.length} label="Total Laps" icon={Flag} delay={0.1} />
                        <StatsCard value={laps.length * 5000} label="Data Points" icon={BarChart3} delay={0.2} />
                        <StatsCard value={1} label="Active Sessions" icon={Zap} delay={0.3} />
                        <StatsCard value={97} label="Success Rate" suffix="%" icon={CheckCircle2} delay={0.4} />
                    </div>
                </motion.section>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 bg-f1-red/20 border-2 border-f1-red rounded-lg p-6 flex items-center gap-4"
                    >
                        <AlertTriangle className="w-10 h-10 text-f1-red-bright" />
                        <div>
                            <h3 className="text-xl font-racing text-f1-red-bright mb-1">SYSTEM ALERT</h3>
                            <p className="text-f1-silver font-tech">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* Lap Analysis Section */}
                {laps.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mt-16 space-y-8"
                    >
                        {/* Section Header with Lap Selector */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-10 bg-f1-red"></div>
                                <h2 className="text-4xl font-racing font-bold text-white">
                                    LAP ANALYSIS
                                </h2>
                            </div>

                            {/* Lap Selector */}
                            <div className="bg-white/95 backdrop-blur-sm border-2 border-f1-red/20 rounded-lg p-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-tech text-gray-700 font-semibold">
                                        SELECT LAP
                                    </span>
                                    <select
                                        value={selectedLap || ''}
                                        onChange={(e) => setSelectedLap(Number(e.target.value))}
                                        className="bg-gray-50 border-2 border-f1-red text-gray-900 font-racing text-lg rounded-lg px-4 py-2 focus:ring-f1-red focus:border-f1-red"
                                    >
                                        {laps.map((lap) => (
                                            <option key={lap.lap_number} value={lap.lap_number}>
                                                LAP {lap.lap_number} {lap.lap_time ? `- ${(lap.lap_time / 1000).toFixed(3)}s` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* AI Insights */}
                        {selectedLapData && (
                            <AIInsights lapData={selectedLapData} />
                        )}

                        {/* Telemetry Charts */}
                        {isTelemetryLoading && (
                            <div className="flex items-center justify-center py-20">
                                <div className="spinner-red"></div>
                                <span className="ml-4 text-f1-silver font-tech">Loading telemetry data...</span>
                            </div>
                        )}

                        {!isTelemetryLoading && telemetryData && selectedLapData && telemetryData.data_points && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <TelemetryCharts telemetry={{
                                    lap_number: selectedLapData.lap_number,
                                    data_points: telemetryData.data_points,
                                    total_points: telemetryData.data_points.length
                                }} />
                            </motion.div>
                        )}

                        {!isTelemetryLoading && (!telemetryData || !telemetryData.data_points || telemetryData.data_points.length === 0) && (
                            <div className="bg-white/95 backdrop-blur-sm border-2 border-f1-red/20 rounded-lg p-12 text-center">
                                <p className="text-gray-700 font-tech text-lg">
                                    No detailed telemetry data available for Lap {selectedLap}
                                </p>
                            </div>
                        )}
                    </motion.section>
                )}

                {/* No Data State */}
                {!isLoading && laps.length === 0 && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 glass-red rounded-lg p-16 text-center border-2 border-f1-red/30 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-f1-red/5 to-transparent"></div>
                        <div className="relative z-10">
                            {/* Animated F1 Car Icon */}
                            <div className="flex justify-center mb-8 animate-float">
                                <svg className="w-40 h-40 text-f1-red opacity-60" viewBox="0 0 120 60" fill="none">
                                    <path d="M20 30 L35 25 L55 23 L75 25 L95 30 L90 38 L75 40 L45 40 L30 38 Z"
                                        fill="currentColor" opacity="0.4" />
                                    <rect x="50" y="20" width="25" height="12" rx="3" fill="currentColor" opacity="0.6" />
                                    <circle cx="40" cy="40" r="8" fill="currentColor" />
                                    <circle cx="75" cy="40" r="8" fill="currentColor" />
                                </svg>
                            </div>

                            <h3 className="text-3xl font-racing text-white mb-3">NO TELEMETRY DATA</h3>
                            <p className="text-f1-silver font-tech text-lg mb-8">
                                Initialize data collection to begin performance analysis
                            </p>

                            <div className="bg-bg-red-dark rounded-lg p-6 max-w-2xl mx-auto border border-f1-red/30">
                                <p className="text-sm text-f1-red-bright font-mono mb-3 uppercase tracking-wider">
                                    /// Quick Start:
                                </p>
                                <p className="text-f1-silver font-tech text-sm">
                                    Navigate to <span className="text-f1-red-bright font-semibold">INPUT DATA</span> page to start recording lap telemetry
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
