"""
ML model training for F1 lap time prediction.

Trains a Random Forest model to predict lap times based on telemetry features.
The model learns patterns from historical data to estimate optimal lap times
given tire condition, track temperature, and driving inputs.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json
from pathlib import Path

from ml.data_generator import F1TelemetryGenerator, generate_session_data
from ml.feature_engineering import extract_lap_features, create_feature_matrix


def prepare_training_data(num_sessions: int = 10, laps_per_session: int = 25) -> tuple:
    """
    Generate synthetic training data from simulated sessions.
    
    Creates realistic telemetry data with various conditions (tire compounds,
    wear levels, track temps, driver errors) to train a robust model.
    
    Args:
        num_sessions: Number of practice/qualifying sessions to simulate
        laps_per_session: Laps per session
    
    Returns:
        Tuple of (X_features, y_laptimes, lap_metadata)
    """
    print(f"🏎️  Generating training data: {num_sessions} sessions × {laps_per_session} laps")
    
    generator = F1TelemetryGenerator()
    all_laps = []
    all_lap_times = []
    
    for session in range(num_sessions):
        print(f"\n  Session {session + 1}/{num_sessions}...")
        
        for lap in range(1, laps_per_session + 1):
            # Vary tire strategy across sessions
            if lap <= 8:
                tire_compound = np.random.choice(['soft', 'medium'], p=[0.7, 0.3])
                tire_age = lap - 1
            else:
                tire_compound = np.random.choice(['medium', 'hard'], p=[0.6, 0.4])
                tire_age = lap - 9
            
            # Random track conditions
            track_temp = np.random.uniform(35, 50)
            
            # Occasional driver errors
            driver_error = np.random.random() < 0.15
            
            lap_telemetry = generator.generate_lap(
                lap_number=lap,
                tire_compound=tire_compound,
                tire_age=tire_age,
                track_temperature=track_temp,
                driver_error=driver_error
            )
            
            # Extract lap time (from last data point)
            lap_time = lap_telemetry[-1]['lap_time']
            
            all_laps.append(lap_telemetry)
            all_lap_times.append(lap_time)
    
    print(f"\n✅ Generated {len(all_laps)} total laps")
    print("🔧 Extracting features...")
    
    # Extract features from all laps
    X = create_feature_matrix(all_laps)
    y = np.array(all_lap_times)
    
    print(f"📊 Feature matrix shape: {X.shape}")
    print(f"📊 Target shape: {y.shape}")
    
    return X, y


def train_model(X: pd.DataFrame, y: np.ndarray, model_type: str = 'random_forest'):
    """
    Train lap time prediction model.
    
    Args:
        X: Feature matrix
        y: Target lap times
        model_type: 'random_forest' or 'gradient_boosting'
    
    Returns:
        Trained model and evaluation metrics
    """
    print(f"\n🤖 Training {model_type} model...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"  Training set: {len(X_train)} laps")
    print(f"  Test set: {len(X_test)} laps")
    
    # Initialize model
    if model_type == 'random_forest':
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
    else:  # gradient_boosting
        model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42
        )
    
    # Train model
    print("  Training...")
    model.fit(X_train, y_train)
    
    # Evaluate on test set
    print("\n📈 Evaluating model...")
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    train_mae = mean_absolute_error(y_train, y_pred_train)
    test_mae = mean_absolute_error(y_test, y_pred_test)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    train_r2 = r2_score(y_train, y_pred_train)
    test_r2 = r2_score(y_test, y_pred_test)
    
    print("\n" + "="*60)
    print("MODEL PERFORMANCE")
    print("="*60)
    print(f"Train MAE:  {train_mae:.3f}s  |  Test MAE:  {test_mae:.3f}s")
    print(f"Train RMSE: {train_rmse:.3f}s  |  Test RMSE: {test_rmse:.3f}s")
    print(f"Train R²:   {train_r2:.3f}   |  Test R²:   {test_r2:.3f}")
    print("="*60)
    
    # Feature importance
    if hasattr(model, 'feature_importances_'):
        feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\n🎯 Top 10 Most Important Features:")
        print("-"*60)
        for idx, row in feature_importance.head(10).iterrows():
            print(f"  {row['feature']:.<45} {row['importance']:.4f}")
        print("-"*60)
    
    # Cross-validation
    print("\n🔄 Cross-validation (5-fold)...")
    cv_scores = cross_val_score(
        model, X, y, cv=5, scoring='neg_mean_absolute_error', n_jobs=-1
    )
    cv_mae = -cv_scores.mean()
    cv_std = cv_scores.std()
    print(f"  CV MAE: {cv_mae:.3f}s (±{cv_std:.3f}s)")
    
    metrics = {
        'train_mae': float(train_mae),
        'test_mae': float(test_mae),
        'train_rmse': float(train_rmse),
        'test_rmse': float(test_rmse),
        'train_r2': float(train_r2),
        'test_r2': float(test_r2),
        'cv_mae': float(cv_mae),
        'cv_std': float(cv_std)
    }
    
    return model, metrics, feature_importance if hasattr(model, 'feature_importances_') else None


def save_model(model, metrics, feature_importance, output_dir: str = 'models'):
    """
    Save trained model and metadata.
    
    Args:
        model: Trained sklearn model
        metrics: Performance metrics dictionary
        feature_importance: Feature importance DataFrame
        output_dir: Directory to save model files
    """
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # Save model
    model_file = output_path / 'lap_time_model.joblib'
    joblib.dump(model, model_file)
    print(f"\n💾 Model saved to {model_file}")
    
    # Save metrics
    metrics_file = output_path / 'model_metrics.json'
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"💾 Metrics saved to {metrics_file}")
    
    # Save feature importance
    if feature_importance is not None:
        importance_file = output_path / 'feature_importance.csv'
        feature_importance.to_csv(importance_file, index=False)
        print(f"💾 Feature importance saved to {importance_file}")
    
    print("\n✅ Model training complete!")


def main():
    """Main training pipeline."""
    print("="*60)
    print("F1 LAP TIME PREDICTION - MODEL TRAINING")
    print("="*60)
    
    # Generate training data
    X, y = prepare_training_data(num_sessions=15, laps_per_session=25)
    
    # Train Random Forest model
    model, metrics, feature_importance = train_model(X, y, model_type='random_forest')
    
    # Save model
    save_model(model, metrics, feature_importance)
    
    print("\n" + "="*60)
    print("Training complete! Model ready for predictions.")
    print("="*60)


if __name__ == "__main__":
    main()
