# F1 Telemetry Analyzer - API Documentation

Complete REST API reference for the F1 Telemetry Analyzer backend.

**Base URL:** `http://localhost:8000`

## Overview

The API provides endpoints for:
- Uploading telemetry data
- Retrieving lap telemetry
- Getting AI-powered analysis
- Predicting lap times
- Listing available laps

All responses use JSON format. Timestamps are in ISO 8601 format.

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check API status and database connectivity.

**Response:**
```json
{
  "status": "healthy",
  "service": "f1-telemetry-api",
  "database": "connected"
}
```

---

### 2. Upload Telemetry

**POST** `/telemetry/upload`

Upload telemetry data for a lap. Typically contains 500-1000 data points per lap sampled at 100Hz.

**Request Body:**
```json
{
  "data_points": [
    {
      "lap_number": 12,
      "sector": 1,
      "timestamp": 0.0,
      "speed": 120.5,
      "throttle": 85.0,
      "brake": 0.0,
      "steering_angle": -15.3,
      "gear": 3,
      "tire_compound": "soft",
      "tire_wear": 25.5,
      "track_temperature": 42.0,
      "lap_time": null
    },
    // ... more data points
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Telemetry data uploaded for lap 12",
  "data_points_stored": 876
}
```

**Validation Rules:**
- `speed`: 0-400 km/h
- `throttle`: 0-100%
- `brake`: 0-100%
- `steering_angle`: -540 to +540 degrees
- `gear`: 0-8 (0=neutral)
- `tire_compound`: "soft", "medium", or "hard"
- `tire_wear`: 0-100%
- `track_temperature`: 0-60°C

---

### 3. List All Laps

**GET** `/telemetry/laps`

Get summary of all available laps in the database.

**Response:**
```json
{
  "laps": [
    {
      "lap_number": 1,
      "lap_time": 88.456,
      "data_points": 892
    },
    {
      "lap_number": 2,
      "lap_time": 88.234,
      "data_points": 876
    }
  ],
  "total": 2
}
```

---

### 4. Get Lap Telemetry

**GET** `/telemetry/lap/{lap_number}`

Retrieve raw telemetry data for a specific lap. Data is ordered chronologically by timestamp.

**Path Parameters:**
- `lap_number` (integer) - Lap number to retrieve

**Response:**
```json
{
  "lap_number": 12,
  "total_points": 876,
  "data_points": [
    {
      "lap_number": 12,
      "sector": 1,
      "timestamp": 0.0,
      "speed": 120.5,
      "throttle": 85.0,
      "brake": 0.0,
      "steering_angle": -15.3,
      "gear": 3,
      "tire_compound": "soft",
      "tire_wear": 25.5,
      "track_temperature": 42.0,
      "lap_time": null
    },
    // ... 875 more points
  ]
}
```

**Error Responses:**

404 Not Found:
```json
{
  "detail": "No telemetry data found for lap 12"
}
```

---

### 5. Get Lap Analysis

**GET** `/telemetry/analysis/{lap_number}`

Get AI-powered analysis for a specific lap. If analysis doesn't exist, it will be generated on-the-fly.

**Path Parameters:**
- `lap_number` (integer) - Lap number to analyze

**Response:**
```json
{
  "lap_number": 12,
  "predicted_lap_time": 88.456,
  "actual_lap_time": 89.234,
  "delta": 0.778,
  "performance_score": 87.3,
  "feedback": [
    "Time loss detected: 0.778s slower than predicted optimal",
    "Late braking detected in Sector 2",
    "Tire degradation affecting corner exit in Sector 3"
  ],
  "sector_times": {
    "1": 29.145,
    "2": 30.523,
    "3": 29.566
  },
  "mistakes_detected": [
    {
      "sector": 2,
      "type": "late_braking",
      "severity": "medium",
      "description": "Late braking detected in Sector 2 - braking from high speed",
      "time_lost": 0.234
    },
    {
      "sector": 3,
      "type": "tire_degradation",
      "severity": "medium",
      "description": "Significant tire degradation (45.2% wear on soft compound)",
      "time_lost": 0.150
    }
  ],
  "created_at": "2026-01-26T17:26:00Z"
}
```

**Mistake Types:**
- `late_braking` - Braking point later than optimal
- `throttle_inconsistency` - Multiple sudden throttle lifts
- `throttle_lift` - Early throttle lift, not reaching full throttle
- `tire_degradation` - Significant tire wear affecting performance
- `low_corner_speed` - Minimum corner speed below expected

**Severity Levels:**
- `low` - Minor issue, <0.1s time loss
- `medium` - Noticeable issue, 0.1-0.3s time loss
- `high` - Major issue, >0.3s time loss

**Error Responses:**

404 Not Found:
```json
{
  "detail": "No telemetry data found for lap 12"
}
```

400 Bad Request:
```json
{
  "detail": "Lap 12 does not have a recorded lap time"
}
```

---

### 6. Predict Lap Time

**GET** `/telemetry/predict-laptime`

Predict lap time based on tire condition and track temperature using the ML model.

**Query Parameters:**
- `tire_compound` (string) - Tire type: "soft", "medium", or "hard"
- `tire_wear` (float) - Tire wear percentage (0-100)
- `track_temp` (float) - Track temperature in Celsius (0-60)

**Example Request:**
```
GET /telemetry/predict-laptime?tire_compound=soft&tire_wear=25.5&track_temp=42.0
```

**Response:**
```json
{
  "predicted_time": 88.456,
  "confidence_interval": [87.923, 89.012],
  "key_factors": {
    "tire_compound": 0.35,
    "tire_wear": 0.30,
    "track_temperature": 0.20,
    "avg_speed": 0.15
  }
}
```

**Key Factors:**
- Values represent feature importance (0-1)
- Higher values = stronger influence on lap time
- Sum of all factors ≈ 1.0

---

## Error Handling

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (lap doesn't exist)
- `422` - Validation Error (invalid data format)
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production use, implement rate limiting based on your requirements.

---

## Authentication

Currently no authentication is required. For production use, implement:
- API keys
- JWT tokens
- OAuth 2.0

---

## Data Formats

### Timestamps
- Relative to lap start (0.0 = start of lap)
- Measured in seconds with millisecond precision
- Float format: `23.456`

### Lap Times
- Measured in seconds
- Format: `MM:SS.mmm` (1:28.456)
- Stored as float: `88.456`

### Percentages
- Range: 0-100
- Float format: `85.5`

### Temperatures
- Celsius
- Float format: `42.5`

---

## Examples

### Upload Complete Lap

```bash
curl -X POST http://localhost:8000/telemetry/upload \
  -H "Content-Type: application/json" \
  -d '{
    "data_points": [
      {
        "lap_number": 1,
        "sector": 1,
        "timestamp": 0.0,
        "speed": 120.0,
        "throttle": 100.0,
        "brake": 0.0,
        "steering_angle": 0.0,
        "gear": 3,
        "tire_compound": "soft",
        "tire_wear": 0.0,
        "track_temperature": 42.0,
        "lap_time": null
      }
    ]
  }'
```

### Get Analysis

```bash
curl http://localhost:8000/telemetry/analysis/1
```

### Predict Lap Time

```bash
curl "http://localhost:8000/telemetry/predict-laptime?tire_compound=soft&tire_wear=25&track_temp=42"
```

---

## Interactive Documentation

Visit these URLs for interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Both provide:
- Complete endpoint documentation
- Request/response examples
- Try-it-out functionality
- Schema definitions
