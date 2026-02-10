"""
ML model predictor for lap time estimation.

Loads trained model and makes predictions on new telemetry data.
Used by the FastAPI backend to provide real-time lap time predictions.
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Dict

from ml.feature_engineering import extract_lap_features


class LapTimePredictor:
    """
    Lap time prediction engine using trained ML model.
    
    Loads model on initialization and provides prediction methods
    for both raw telemetry and parameter-based predictions.
    """
    
    def __init__(self, model_path: str = 'models/lap_time_model.joblib'):
        """
        Initialize predictor with trained model.
        
        Args:
            model_path: Path to saved model file
        """
        model_file = Path(__file__).parent / model_path
        
        if not model_file.exists():
            print(f"⚠️  Model file not found: {model_file}")
            print("   Run model_training.py first to train the model")
            self.model = None
        else:
            self.model = joblib.load(model_file)
            print(f"✅ Model loaded from {model_file}")
    
    def predict(self, telemetry_points: List[Dict]) -> float:
        """
        Predict lap time from raw telemetry data.
        
        Args:
            telemetry_points: List of telemetry dictionaries for one lap
        
        Returns:
            Predicted lap time in seconds
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Train model first.")
        
        # Extract features
        features = extract_lap_features(telemetry_points)
        features_df = pd.DataFrame([features])
        
        # Predict
        prediction = self.model.predict(features_df)[0]
        
        return round(prediction, 3)
    
    def predict_with_confidence(self, telemetry_points: List[Dict]) -> Dict:
        """
        Predict lap time with confidence interval.
        
        For Random Forest, uses individual tree predictions to estimate uncertainty.
        
        Args:
            telemetry_points: List of telemetry dictionaries
        
        Returns:
            Dictionary with prediction, confidence interval, and feature importance
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Train model first.")
        
        # Extract features
        features = extract_lap_features(telemetry_points)
        features_df = pd.DataFrame([features])
        
        # Get prediction
        prediction = self.model.predict(features_df)[0]
        
        # Estimate confidence interval (for Random Forest)
        if hasattr(self.model, 'estimators_'):
            # Get predictions from all trees
            tree_predictions = np.array([
                tree.predict(features_df)[0] for tree in self.model.estimators_
            ])
            
            # Calculate percentiles for confidence interval
            lower = np.percentile(tree_predictions, 10)
            upper = np.percentile(tree_predictions, 90)
        else:
            # Fallback: use simple margin
            lower = prediction - 0.5
            upper = prediction + 0.5
        
        # Get feature importance for this prediction
        if hasattr(self.model, 'feature_importances_'):
            feature_names = list(features.keys())
            importances = self.model.feature_importances_
            
            # Sort and get top 5
            top_indices = np.argsort(importances)[-5:][::-1]
            key_factors = {
                feature_names[i]: float(importances[i])
                for i in top_indices
            }
        else:
            key_factors = {}
        
        return {
            'predicted_time': round(prediction, 3),
            'confidence_interval': (round(lower, 3), round(upper, 3)),
            'key_factors': key_factors
        }
    
    def predict_from_params(
        self,
        tire_compound: str,
        tire_wear: float,
        track_temp: float
    ) -> Dict:
        """
        Predict lap time from high-level parameters.
        
        Used when full telemetry isn't available yet (e.g., strategy planning).
        Creates synthetic "average" features based on typical driving patterns.
        
        Args:
            tire_compound: Tire type (soft/medium/hard)
            tire_wear: Tire wear percentage (0-100)
            track_temp: Track temperature in Celsius
        
        Returns:
            Prediction dictionary with time and key factors
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Train model first.")
        
        # Create synthetic features based on typical values
        # These represent "average" driving for the given tire/temp conditions
        
        compound_map = {'soft': 1, 'medium': 2, 'hard': 3}
        tire_num = compound_map.get(tire_compound.lower(), 2)
        
        # Baseline speeds adjusted for tire compound
        base_speed_adjustment = {'soft': 5, 'medium': 0, 'hard': -3}
        speed_adj = base_speed_adjustment.get(tire_compound.lower(), 0)
        
        # Adjust for tire wear (decreases speed)
        wear_speed_penalty = tire_wear * 0.3
        
        features = {
            'avg_speed': 220 + speed_adj - wear_speed_penalty,
            'max_speed': 340 + speed_adj,
            'min_speed': 105 - tire_wear * 0.1,
            'speed_variance': 8500,
            'avg_throttle': 65.0,
            'throttle_consistency': 85.0,
            'full_throttle_pct': 35.0,
            'throttle_lifts': 3,
            'avg_brake': 15.0,
            'max_brake': 100.0,
            'brake_applications': 8,
            'heavy_brake_events': 15,
            'avg_steering_abs': 35.0,
            'max_steering_abs': 180.0,
            'steering_smoothness': 75.0,
            'avg_gear': 5.5,
            'max_gear': 8,
            'gear_changes': 45,
            'tire_wear': tire_wear,
            'tire_compound': tire_num,
            'track_temperature': track_temp,
            'temp_delta_from_optimal': abs(track_temp - 42.5),
            'brake_to_throttle_time': 0.8,
            # Sector-specific features (typical values)
            'avg_speed_sector_1': 240 + speed_adj - wear_speed_penalty,
            'min_speed_sector_1': 120,
            'exit_acceleration_sector_1': 85,
            'avg_speed_sector_2': 185 + speed_adj - wear_speed_penalty,
            'min_speed_sector_2': 95,
            'exit_acceleration_sector_2': 70,
            'avg_speed_sector_3': 235 + speed_adj - wear_speed_penalty,
            'min_speed_sector_3': 145,
            'exit_acceleration_sector_3': 90,
        }
        
        features_df = pd.DataFrame([features])
        prediction = self.model.predict(features_df)[0]
        
        # Estimate confidence interval
        if hasattr(self.model, 'estimators_'):
            tree_predictions = np.array([
                tree.predict(features_df)[0] for tree in self.model.estimators_
            ])
            lower = np.percentile(tree_predictions, 10)
            upper = np.percentile(tree_predictions, 90)
        else:
            lower = prediction - 0.5
            upper = prediction + 0.5
        
        # Key factors for parameter-based prediction
        key_factors = {
            'tire_compound': 0.35,
            'tire_wear': 0.30,
            'track_temperature': 0.20,
            'avg_speed': 0.15
        }
        
        return {
            'predicted_time': round(prediction, 3),
            'confidence_interval': (round(lower, 3), round(upper, 3)),
            'key_factors': key_factors
        }


# Global predictor instance (lazy loaded)
_predictor = None


def get_predictor() -> LapTimePredictor:
    """Get singleton predictor instance."""
    global _predictor
    if _predictor is None:
        _predictor = LapTimePredictor()
    return _predictor


def predict_lap_time(telemetry_points: List[Dict]) -> float:
    """
    Convenience function to predict lap time from telemetry.
    
    Args:
        telemetry_points: List of telemetry data points
    
    Returns:
        Predicted lap time in seconds
    """
    predictor = get_predictor()
    return predictor.predict(telemetry_points)


def predict_lap_time_from_params(
    tire_compound: str,
    tire_wear: float,
    track_temp: float
) -> Dict:
    """
    Convenience function to predict lap time from parameters.
    
    Args:
        tire_compound: Tire type
        tire_wear: Tire wear percentage
        track_temp: Track temperature
    
    Returns:
        Prediction dictionary
    """
    predictor = get_predictor()
    return predictor.predict_from_params(tire_compound, tire_wear, track_temp)


if __name__ == "__main__":
    # Test predictor
    print("🧪 Testing predictor...")
    
    from ml.data_generator import F1TelemetryGenerator
    
    generator = F1TelemetryGenerator()
    lap_data = generator.generate_lap(
        lap_number=1,
        tire_compound='soft',
        tire_age=5,
        track_temperature=42.0
    )
    
    actual_time = lap_data[-1]['lap_time']
    
    try:
        predictor = LapTimePredictor()
        if predictor.model:
            predicted_time = predictor.predict(lap_data)
            
            print(f"\n📊 Actual lap time:    {actual_time:.3f}s")
            print(f"🤖 Predicted time:     {predicted_time:.3f}s")
            print(f"📈 Delta:              {abs(actual_time - predicted_time):.3f}s")
            
            # Test confidence prediction
            result = predictor.predict_with_confidence(lap_data)
            print(f"\n🎯 Confidence interval: {result['confidence_interval']}")
            print(f"\n🔑 Key factors:")
            for factor, importance in list(result['key_factors'].items())[:5]:
                print(f"  {factor:.<40} {importance:.4f}")
        else:
            print("⚠️  Model not available. Run model_training.py first.")
    except Exception as e:
        print(f"❌ Error: {e}")
