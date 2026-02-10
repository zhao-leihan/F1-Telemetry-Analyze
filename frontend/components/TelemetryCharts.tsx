/**
 * Telemetry visualization component using Chart.js.
 * 
 * Displays speed, throttle, brake, gear, and steering data
 * in professional engineering charts used by F1 teams.
 */

'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { LapData } from '@/types/telemetry';

Chart.register(...registerables);

interface TelemetryChartsProps {
    telemetry: LapData;
}

export default function TelemetryCharts({ telemetry }: TelemetryChartsProps) {
    const speedChartRef = useRef<HTMLCanvasElement>(null);
    const inputsChartRef = useRef<HTMLCanvasElement>(null);
    const gearChartRef = useRef<HTMLCanvasElement>(null);

    const speedChartInstance = useRef<Chart | null>(null);
    const inputsChartInstance = useRef<Chart | null>(null);
    const gearChartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (!telemetry.data_points || telemetry.data_points.length === 0) return;

        // Prepare data
        const timestamps = telemetry.data_points.map(d => d.timestamp);
        const speeds = telemetry.data_points.map(d => d.speed);
        const throttle = telemetry.data_points.map(d => d.throttle);
        const brake = telemetry.data_points.map(d => d.brake);
        const gears = telemetry.data_points.map(d => d.gear);

        // Chart.js default options for all charts
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index' as const,
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#C8C8C8',
                        font: {
                            family: 'Inter',
                        },
                    },
                },
                tooltip: {
                    backgroundColor: '#15151E',
                    titleColor: '#FFFFFF',
                    bodyColor: '#C8C8C8',
                    borderColor: '#E10600',
                    borderWidth: 1,
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (seconds)',
                        color: '#C8C8C8',
                    },
                    ticks: {
                        color: '#C8C8C8',
                    },
                    grid: {
                        color: '#38383F',
                    },
                },
                y: {
                    ticks: {
                        color: '#C8C8C8',
                    },
                    grid: {
                        color: '#38383F',
                    },
                },
            },
        };

        // Speed Chart
        if (speedChartRef.current) {
            if (speedChartInstance.current) {
                speedChartInstance.current.destroy();
            }

            const ctx = speedChartRef.current.getContext('2d');
            if (ctx) {
                speedChartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: timestamps,
                        datasets: [
                            {
                                label: 'Speed (km/h)',
                                data: speeds,
                                borderColor: '#E10600',
                                backgroundColor: 'rgba(225, 6, 0, 0.1)',
                                borderWidth: 2,
                                tension: 0.1,
                                pointRadius: 0,
                            },
                        ],
                    },
                    options: {
                        ...commonOptions,
                        scales: {
                            ...commonOptions.scales,
                            y: {
                                ...commonOptions.scales?.y,
                                title: {
                                    display: true,
                                    text: 'Speed (km/h)',
                                    color: '#C8C8C8',
                                },
                                min: 0,
                                max: 350,
                            },
                        },
                    },
                });
            }
        }

        // Inputs Chart (Throttle & Brake)
        if (inputsChartRef.current) {
            if (inputsChartInstance.current) {
                inputsChartInstance.current.destroy();
            }

            const ctx = inputsChartRef.current.getContext('2d');
            if (ctx) {
                inputsChartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: timestamps,
                        datasets: [
                            {
                                label: 'Throttle (%)',
                                data: throttle,
                                borderColor: '#00FF00',
                                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                                borderWidth: 2,
                                tension: 0.1,
                                pointRadius: 0,
                            },
                            {
                                label: 'Brake (%)',
                                data: brake,
                                borderColor: '#FF0000',
                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                borderWidth: 2,
                                tension: 0.1,
                                pointRadius: 0,
                            },
                        ],
                    },
                    options: {
                        ...commonOptions,
                        scales: {
                            ...commonOptions.scales,
                            y: {
                                ...commonOptions.scales?.y,
                                title: {
                                    display: true,
                                    text: 'Input (%)',
                                    color: '#C8C8C8',
                                },
                                min: 0,
                                max: 100,
                            },
                        },
                    },
                });
            }
        }

        // Gear Chart
        if (gearChartRef.current) {
            if (gearChartInstance.current) {
                gearChartInstance.current.destroy();
            }

            const ctx = gearChartRef.current.getContext('2d');
            if (ctx) {
                gearChartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: timestamps,
                        datasets: [
                            {
                                label: 'Gear',
                                data: gears,
                                borderColor: '#FFD700',
                                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                borderWidth: 2,
                                stepped: true,
                                pointRadius: 0,
                            },
                        ],
                    },
                    options: {
                        ...commonOptions,
                        scales: {
                            ...commonOptions.scales,
                            y: {
                                ...commonOptions.scales?.y,
                                title: {
                                    display: true,
                                    text: 'Gear',
                                    color: '#C8C8C8',
                                },
                                min: 0,
                                max: 8,
                                ticks: {
                                    stepSize: 1,
                                    color: '#C8C8C8',
                                },
                            },
                        },
                    },
                });
            }
        }

        // Cleanup
        return () => {
            if (speedChartInstance.current) speedChartInstance.current.destroy();
            if (inputsChartInstance.current) inputsChartInstance.current.destroy();
            if (gearChartInstance.current) gearChartInstance.current.destroy();
        };
    }, [telemetry]);

    // Calculate sector boundaries for visual reference
    const sectorInfo = telemetry.data_points.reduce((acc, point) => {
        if (!acc[point.sector]) {
            acc[point.sector] = { start: point.timestamp, end: point.timestamp };
        }
        acc[point.sector].end = Math.max(acc[point.sector].end, point.timestamp);
        return acc;
    }, {} as Record<number, { start: number; end: number }>);

    return (
        <div className="space-y-6">
            {/* Sector Info Banner */}
            <div className="bg-f1-grey rounded-lg p-4 border border-f1-red/30">
                <h3 className="text-sm font-semibold text-f1-silver mb-3">SECTOR TIMES</h3>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(sector => {
                        const info = sectorInfo[sector];
                        const duration = info ? info.end - info.start : 0;
                        return (
                            <div key={sector} className="text-center">
                                <div className="text-xs text-f1-silver mb-1">Sector {sector}</div>
                                <div className="text-2xl font-bold font-mono text-white">
                                    {duration.toFixed(3)}s
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Speed Chart */}
            <div className="bg-f1-grey rounded-lg p-6 border border-f1-red/30">
                <h3 className="text-lg font-bold text-white mb-4">Speed Trace</h3>
                <div className="h-64">
                    <canvas ref={speedChartRef}></canvas>
                </div>
            </div>

            {/* Throttle & Brake Chart */}
            <div className="bg-f1-grey rounded-lg p-6 border border-f1-red/30">
                <h3 className="text-lg font-bold text-white mb-4">Driver Inputs</h3>
                <div className="h-64">
                    <canvas ref={inputsChartRef}></canvas>
                </div>
            </div>

            {/* Gear Chart */}
            <div className="bg-f1-grey rounded-lg p-6 border border-f1-red/30">
                <h3 className="text-lg font-bold text-white mb-4">Gear Selection</h3>
                <div className="h-48">
                    <canvas ref={gearChartRef}></canvas>
                </div>
            </div>

            {/* Telemetry Stats */}
            <div className="bg-f1-grey rounded-lg p-6 border border-f1-red/30">
                <h3 className="text-lg font-bold text-white mb-4">Telemetry Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-f1-silver mb-1">MAX SPEED</p>
                        <p className="text-xl font-bold text-white">
                            {Math.max(...telemetry.data_points.map(d => d.speed)).toFixed(1)} km/h
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-f1-silver mb-1">AVG SPEED</p>
                        <p className="text-xl font-bold text-white">
                            {(telemetry.data_points.reduce((sum, d) => sum + d.speed, 0) / telemetry.data_points.length).toFixed(1)} km/h
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-f1-silver mb-1">TIRE COMPOUND</p>
                        <p className="text-xl font-bold text-white uppercase">
                            {telemetry.data_points[0]?.tire_compound || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-f1-silver mb-1">TIRE WEAR</p>
                        <p className="text-xl font-bold text-white">
                            {telemetry.data_points[0]?.tire_wear.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
