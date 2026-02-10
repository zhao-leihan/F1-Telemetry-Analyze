"""
Feature engineering for F1 telemetry ML models.

Extracts meaningful features from raw telemetry data to predict lap times
and identify performance patterns. Features are designed based on real F1
engineering practices.
"""

import numpy as np
import pandas as pd
from typing import List, Dict


def extract_lap_features(telemetry_points: List[Dict]) -> Dict[str, float]:
    """
    Extract ML features from a lap's telemetry data.
    
    Features are designed to capture driving style, tire condition,
    and track conditions that influence lap time.
    
    Args:
        telemetry_points: List of telemetry data dictionaries for one lap
    
    Returns:
        Dictionary of extracted features
    """
    df = pd.DataFrame(telemetry_points)
    
    features = {}
    
    # === Speed Features ===
    features['avg_speed'] = df['speed'].mean()
    features['max_speed'] = df['speed'].max()
    features['min_speed'] = df['speed'].min()
    features['speed_variance'] = df['speed'].var()
    
    # Sector-specific average speeds
    for sector in [1, 2, 3]:
        sector_data = df[df['sector'] == sector]
        if not sector_data.empty:
            features[f'avg_speed_sector_{sector}'] = sector_data['speed'].mean()
            features[f'min_speed_sector_{sector}'] = sector_data['speed'].min()
    
    # === Throttle Features ===
    features['avg_throttle'] = df['throttle'].mean()
    features['throttle_consistency'] = 100 - df['throttle'].std()  # Higher = more consistent
    
    # Throttle application aggressiveness (% of time at >90% throttle)
    features['full_throttle_pct'] = (df['throttle'] > 90).sum() / len(df) * 100
    
    # Detect throttle lifts (sudden drops)
    throttle_changes = df['throttle'].diff().fillna(0)
    features['throttle_lifts'] = (throttle_changes < -30).sum()
    
    # === Brake Features ===
    features['avg_brake'] = df['brake'].mean()
    features['max_brake'] = df['brake'].max()
    
    # Brake applications (number of times brake > 50%)
    brake_crossings = ((df['brake'] > 50) & (df['brake'].shift(1) <= 50)).sum()
    features['brake_applications'] = brake_crossings
    
    # Heavy braking events (brake > 80%)
    features['heavy_brake_events'] = (df['brake'] > 80).sum()
    
    # === Steering Features ===
    features['avg_steering_abs'] = df['steering_angle'].abs().mean()
    features['max_steering_abs'] = df['steering_angle'].abs().max()
    features['steering_smoothness'] = 100 - df['steering_angle'].abs().std()
    
    # === Gear Features ===
    features['avg_gear'] = df['gear'].mean()
    features['max_gear'] = df['gear'].max()
    
    # Gear changes (upshift + downshift count)
    gear_changes = (df['gear'].diff().fillna(0) != 0).sum()
    features['gear_changes'] = gear_changes
    
    # === Tire Features ===
    features['tire_wear'] = df['tire_wear'].iloc[0]  # Should be constant per lap
    
    # Tire compound as numeric (soft=1, medium=2, hard=3)
    compound_map = {'soft': 1, 'medium': 2, 'hard': 3}
    features['tire_compound'] = compound_map.get(df['tire_compound'].iloc[0], 2)
    
    # === Track Condition Features ===
    features['track_temperature'] = df['track_temperature'].iloc[0]
    
    # Temperature-grip relationship (optimal around 40-45°C)
    optimal_temp = 42.5
    features['temp_delta_from_optimal'] = abs(df['track_temperature'].iloc[0] - optimal_temp)
    
    # === Derived Performance Metrics ===
    
    # Brake-to-throttle transition efficiency (lower is better)
    # Measures how quickly driver gets back on throttle after braking
    brake_to_throttle_time = 0
    for i in range(len(df) - 1):
        if df.iloc[i]['brake'] > 50 and df.iloc[i + 1]['throttle'] > 50:
            brake_to_throttle_time += (df.iloc[i + 1]['timestamp'] - df.iloc[i]['timestamp'])
    features['brake_to_throttle_time'] = brake_to_throttle_time
    
    # Corner exit acceleration (avg speed gain after minimum speed)
    for sector in [1, 2, 3]:
        sector_data = df[df['sector'] == sector]
        if not sector_data.empty and len(sector_data) > 5:
            min_speed_idx = sector_data['speed'].idxmin()
            if min_speed_idx < df.index[-1] - 3:
                # Check speed gain in next 3 data points
                exit_speed_gain = df.loc[min_speed_idx + 3, 'speed'] - df.loc[min_speed_idx, 'speed']
                features[f'exit_acceleration_sector_{sector}'] = max(0, exit_speed_gain)
            else:
                features[f'exit_acceleration_sector_{sector}'] = 0
        else:
            features[f'exit_acceleration_sector_{sector}'] = 0
    
    return features


def create_feature_matrix(telemetry_data: List[List[Dict]]) -> pd.DataFrame:
    """
    Create feature matrix for multiple laps.
    
    Args:
        telemetry_data: List of laps, each lap is a list of telemetry dicts
    
    Returns:
        DataFrame with features for each lap
    """
    features_list = []
    
    for lap_telemetry in telemetry_data:
        features = extract_lap_features(lap_telemetry)
        features_list.append(features)
    
    return pd.DataFrame(features_list)


def get_feature_names() -> List[str]:
    """
    Get list of all feature names for model training.
    
    Returns:
        List of feature column names
    """
    # Return expected feature names (derived from extract_lap_features)
    base_features = [
        'avg_speed', 'max_speed', 'min_speed', 'speed_variance',
        'avg_throttle', 'throttle_consistency', 'full_throttle_pct', 'throttle_lifts',
        'avg_brake', 'max_brake', 'brake_applications', 'heavy_brake_events',
        'avg_steering_abs', 'max_steering_abs', 'steering_smoothness',
        'avg_gear', 'max_gear', 'gear_changes',
        'tire_wear', 'tire_compound', 'track_temperature', 'temp_delta_from_optimal',
        'brake_to_throttle_time'
    ]
    
    sector_features = []
    for sector in [1, 2, 3]:
        sector_features.extend([
            f'avg_speed_sector_{sector}',
            f'min_speed_sector_{sector}',
            f'exit_acceleration_sector_{sector}'
        ])
    
    return base_features + sector_features


if __name__ == "__main__":
    # Test feature extraction
    import json
    from ml.data_generator import F1TelemetryGenerator
    
    print("🔧 Testing feature extraction...")
    
    generator = F1TelemetryGenerator()
    lap_data = generator.generate_lap(lap_number=1, tire_compound='soft', tire_age=5)
    
    features = extract_lap_features(lap_data)
    
    print(f"\n📊 Extracted {len(features)} features:")
    for name, value in features.items():
        print(f"  {name:.<40} {value:.3f}")
    
    print(f"\n✅ Feature extraction successful!")
