/**
 * API client for F1 Telemetry Analyzer backend.
 * 
 * Provides typed functions for all backend endpoints.
 * Handles errors and provides consistent response formatting.
 */

import axios from 'axios';
import { LapData, LapAnalysis, LapSummary, LapTimePrediction, TelemetryDataPoint } from '@/types/telemetry';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Get list of all available laps.
 */
export async function getAllLaps(): Promise<LapSummary[]> {
    const response = await api.get('/telemetry/laps');
    return response.data.laps;
}

/**
 * Get raw telemetry data for a specific lap.
 */
export async function getLapTelemetry(lapNumber: number): Promise<LapData> {
    const response = await api.get(`/telemetry/lap/${lapNumber}`);
    return response.data;
}

/**
 * Get AI analysis for a specific lap.
 */
export async function getLapAnalysis(lapNumber: number): Promise<LapAnalysis> {
    const response = await api.get(`/telemetry/analysis/${lapNumber}`);
    return response.data;
}

/**
 * Predict lap time based on tire and track conditions.
 */
export async function predictLapTime(
    tireCompound: string,
    tireWear: number,
    trackTemp: number
): Promise<LapTimePrediction> {
    const response = await api.get('/telemetry/predict-laptime', {
        params: {
            tire_compound: tireCompound,
            tire_wear: tireWear,
            track_temp: trackTemp,
        },
    });
    return response.data;
}

/**
 * Upload telemetry data for a lap.
 */
export async function uploadTelemetry(dataPoints: TelemetryDataPoint[]): Promise<{ message: string }> {
    const response = await api.post('/telemetry/upload', {
        data_points: dataPoints,
    });
    return response.data;
}

/**
 * Health check endpoint.
 */
export async function checkHealth(): Promise<{ status: string }> {
    const response = await api.get('/health');
    return response.data;
}
