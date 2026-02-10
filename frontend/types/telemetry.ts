/**
 * TypeScript interfaces for F1 telemetry data.
 * 
 * Matches the backend Pydantic schemas to ensure type safety
 * across the frontend-backend boundary.
 */

export interface TelemetryDataPoint {
    lap_number: number;
    sector: number;
    timestamp: number;
    speed: number;
    throttle: number;
    brake: number;
    steering_angle: number;
    gear: number;
    tire_compound: string;
    tire_wear: number;
    track_temperature: number;
    lap_time: number | null;
}

export interface LapData {
    lap_number: number;
    data_points: TelemetryDataPoint[];
    total_points: number;
}

export interface DriverMistake {
    sector: number;
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    time_lost: number;
}

export interface LapAnalysis {
    lap_number: number;
    predicted_lap_time: number;
    actual_lap_time: number;
    delta: number;
    performance_score: number;
    feedback: string[];
    sector_times: { [key: number]: number };
    mistakes_detected: DriverMistake[];
    created_at: string;
}

export interface LapSummary {
    lap_number: number;
    lap_time: number | null;
    data_points: number;
}

export interface LapTimePrediction {
    predicted_time: number;
    confidence_interval: [number, number];
    key_factors: { [key: string]: number };
}
