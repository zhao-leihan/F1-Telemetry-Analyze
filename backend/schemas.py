"""
Pydantic schemas for request/response validation in the F1 Telemetry API.

These schemas ensure data integrity and provide automatic API documentation.
All telemetry data must conform to these schemas before storage.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime


class TelemetryDataPoint(BaseModel):
    """
    Single telemetry data point from the car's sensors.
    
    Validates that all sensor readings are within realistic F1 parameters.
    """
    lap_number: int = Field(..., ge=1, description="Lap number (must be positive)")
    sector: int = Field(..., ge=1, le=3, description="Track sector (1, 2, or 3)")
    timestamp: float = Field(..., ge=0.0, description="Seconds into lap")
    speed: float = Field(..., ge=0.0, le=400.0, description="Speed in km/h")
    throttle: float = Field(..., ge=0.0, le=100.0, description="Throttle percentage")
    brake: float = Field(..., ge=0.0, le=100.0, description="Brake percentage")
    steering_angle: float = Field(..., ge=-540.0, le=540.0, description="Steering angle in degrees")
    gear: int = Field(..., ge=0, le=8, description="Gear (0=neutral, 1-8)")
    tire_compound: str = Field(..., description="Tire compound (soft/medium/hard)")
    tire_wear: float = Field(..., ge=0.0, le=100.0, description="Tire wear percentage")
    track_temperature: float = Field(..., ge=0.0, le=60.0, description="Track temp in Celsius")
    lap_time: Optional[float] = Field(None, ge=0.0, description="Total lap time in seconds")

    @validator('tire_compound')
    def validate_tire_compound(cls, v):
        """Ensure tire compound is valid F1 specification."""
        allowed = ['soft', 'medium', 'hard']
        if v.lower() not in allowed:
            raise ValueError(f"Tire compound must be one of {allowed}")
        return v.lower()

    class Config:
        json_schema_extra = {
            "example": {
                "lap_number": 12,
                "sector": 2,
                "timestamp": 23.45,
                "speed": 287.5,
                "throttle": 98.0,
                "brake": 0.0,
                "steering_angle": -15.3,
                "gear": 7,
                "tire_compound": "soft",
                "tire_wear": 34.2,
                "track_temperature": 42.5,
                "lap_time": 89.234
            }
        }


class TelemetryUpload(BaseModel):
    """
    Batch upload of telemetry data points for a single lap.
    
    Typically contains 500-1000 data points per lap at 100Hz sampling rate.
    """
    data_points: List[TelemetryDataPoint] = Field(..., min_length=1)


class TelemetryResponse(BaseModel):
    """Response model for telemetry retrieval."""
    lap_number: int
    data_points: List[TelemetryDataPoint]
    total_points: int

    class Config:
        from_attributes = True


class DriverMistake(BaseModel):
    """
    Detected driving mistake with location and severity.
    
    Used by race engineers to provide constructive feedback to drivers.
    """
    sector: int
    type: str  # e.g., "late_braking", "throttle_lift", "oversteer"
    severity: str  # "low", "medium", "high"
    description: str
    time_lost: float  # Estimated time lost in seconds


class LapAnalysisResponse(BaseModel):
    """
    Complete AI analysis of a lap with actionable insights.
    
    Presented to engineers on pit wall screens and driver debrief sessions.
    """
    lap_number: int
    predicted_lap_time: float
    actual_lap_time: float
    delta: float
    performance_score: float
    feedback: List[str]
    sector_times: Dict[int, float]
    mistakes_detected: List[DriverMistake]
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "lap_number": 12,
                "predicted_lap_time": 88.456,
                "actual_lap_time": 89.234,
                "delta": 0.778,
                "performance_score": 87.3,
                "feedback": [
                    "Late braking detected in Sector 2",
                    "Tire degradation affecting corner exit in Sector 3"
                ],
                "sector_times": {1: 29.1, 2: 30.5, 3: 29.6},
                "mistakes_detected": [
                    {
                        "sector": 2,
                        "type": "late_braking",
                        "severity": "medium",
                        "description": "Braking point 15m late at Turn 7",
                        "time_lost": 0.234
                    }
                ],
                "created_at": "2026-01-26T17:26:00Z"
            }
        }


class LapTimePrediction(BaseModel):
    """
    ML model prediction for expected lap time.
    
    Based on current car setup, tire condition, and track temperature.
    """
    predicted_time: float
    confidence_interval: tuple[float, float]
    key_factors: Dict[str, float]  # Feature importance

    class Config:
        json_schema_extra = {
            "example": {
                "predicted_time": 88.456,
                "confidence_interval": [87.9, 89.0],
                "key_factors": {
                    "avg_speed_sector_1": 0.35,
                    "tire_wear": 0.28,
                    "track_temperature": 0.15,
                    "brake_consistency": 0.12
                }
            }
        }


class LapListResponse(BaseModel):
    """List of available laps with basic metadata."""
    laps: List[Dict[str, Any]]
    total: int


# Manual Input Schema for Web Form
class ManualTelemetryInput(BaseModel):
    """Schema for manual telemetry input from web form"""
    lap_number: int = Field(..., ge=1, description="Lap number")
    data_points: List[Dict[str, Any]] = Field(..., description="List of telemetry data points")
    
    class Config:
        json_schema_extra = {
            "example": {
                "lap_number": 1,
                "data_points": [
                    {
                        "timestamp": 0.0,
                        "speed": 250.5,
                        "throttle": 95.0,
                        "brake": 0.0,
                        "gear": 7,
                        "track_position": 1250.5
                    }
                ]
            }
        }

