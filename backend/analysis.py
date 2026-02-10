"""
Telemetry analysis algorithms for detecting driving mistakes and performance issues.

These algorithms are based on real F1 engineering practices used by teams
to provide actionable feedback to drivers during and after sessions.
"""

import numpy as np
from typing import List, Dict, Tuple
import schemas


def analyze_braking_points(telemetry: List[Dict], sector: int) -> Dict:
    """
    Detect late or early braking compared to optimal brake points.
    
    In F1, braking consistency and timing are critical for lap time.
    Late braking can lead to lock-ups and missed apexes, while early
    braking wastes straight-line speed.
    
    Args:
        telemetry: List of telemetry data points for a sector
        sector: Sector number being analyzed
    
    Returns:
        Dictionary with braking analysis results
    """
    sector_data = [t for t in telemetry if t.sector == sector]
    
    if not sector_data:
        return {"issue": None}
    
    # Find brake application points (where brake > 10%)
    brake_points = [(t.timestamp, t.brake, t.speed) for t in sector_data if t.brake > 10]
    
    if not brake_points:
        return {"issue": None}
    
    # Detect heavy brake applications (>80% brake pressure)
    heavy_braking = [bp for bp in brake_points if bp[1] > 80]
    
    if not heavy_braking:
        return {"issue": None}
    
    # Check if braking from high speed (>250 km/h) - indicates late braking
    high_speed_braking = [bp for bp in heavy_braking if bp[2] > 250]
    
    if high_speed_braking:
        avg_brake_time = np.mean([bp[0] for bp in high_speed_braking])
        return {
            "issue": "late_braking",
            "severity": "medium",
            "timestamp": avg_brake_time,
            "description": f"Late braking detected in Sector {sector} - braking from high speed",
            "time_lost": 0.2  # Estimated time loss
        }
    
    return {"issue": None}


def analyze_throttle_application(telemetry: List[Dict], sector: int) -> Dict:
    """
    Detect throttle inconsistency or premature throttle lifts.
    
    Optimal F1 driving requires smooth, progressive throttle application
    through corner exits. Lifting or hesitating costs momentum and time.
    
    Args:
        telemetry: List of telemetry data points for a sector
        sector: Sector number being analyzed
    
    Returns:
        Dictionary with throttle analysis results
    """
    sector_data = [t for t in telemetry if t.sector == sector]
    
    if not sector_data:
        return {"issue": None}
    
    # Analyze throttle trace for inconsistencies
    throttle_values = np.array([t.throttle for t in sector_data])
    
    # Detect sudden throttle lifts (drop >30% in short time)
    throttle_changes = np.diff(throttle_values)
    sudden_lifts = np.where(throttle_changes < -30)[0]
    
    if len(sudden_lifts) > 2:  # Multiple lifts indicate inconsistency
        return {
            "issue": "throttle_inconsistency",
            "severity": "medium",
            "description": f"Throttle inconsistency in Sector {sector} - multiple sudden lifts detected",
            "time_lost": 0.15
        }
    
    # Check for early throttle lift (not reaching 100% when expected)
    max_throttle = np.max(throttle_values)
    if max_throttle < 85:  # Never reached near-full throttle
        return {
            "issue": "throttle_lift",
            "severity": "low",
            "description": f"Throttle lift too early in Sector {sector} - not reaching full throttle",
            "time_lost": 0.1
        }
    
    return {"issue": None}


def analyze_tire_degradation(telemetry: List[Dict]) -> Dict:
    """
    Assess tire degradation impact on performance.
    
    As tires wear, grip decreases affecting corner speeds and braking.
    Engineers use this to determine optimal pit stop timing.
    
    Args:
        telemetry: Complete lap telemetry data
    
    Returns:
        Dictionary with tire degradation analysis
    """
    if not telemetry:
        return {"issue": None}
    
    # Get average tire wear for the lap
    avg_tire_wear = np.mean([t.tire_wear for t in telemetry])
    tire_compound = telemetry[0].tire_compound
    
    # Define wear thresholds based on compound
    wear_thresholds = {
        'soft': 40,    # Soft tires degrade faster
        'medium': 60,  # Medium tires more durable
        'hard': 75     # Hard tires most durable
    }
    
    threshold = wear_thresholds.get(tire_compound, 50)
    
    if avg_tire_wear > threshold:
        severity = "high" if avg_tire_wear > threshold + 15 else "medium"
        time_lost = 0.3 if severity == "high" else 0.15
        
        return {
            "issue": "tire_degradation",
            "severity": severity,
            "wear_level": avg_tire_wear,
            "compound": tire_compound,
            "description": f"Significant tire degradation ({avg_tire_wear:.1f}% wear on {tire_compound} compound)",
            "time_lost": time_lost
        }
    
    return {"issue": None}


def analyze_corner_speed(telemetry: List[Dict], sector: int) -> Dict:
    """
    Analyze minimum corner speeds to detect suboptimal cornering.
    
    Maintaining higher minimum speeds through corners is crucial for lap time.
    Low minimum speeds indicate poor line choice or lack of confidence.
    
    Args:
        telemetry: List of telemetry data points
        sector: Sector number being analyzed
    
    Returns:
        Dictionary with corner speed analysis
    """
    sector_data = [t for t in telemetry if t.sector == sector]
    
    if not sector_data:
        return {"issue": None}
    
    # Find minimum speed in sector (typically at corner apex)
    min_speed = min(t.speed for t in sector_data)
    
    # Expected minimum speeds per sector (track-dependent, these are examples)
    expected_min_speeds = {
        1: 120,  # Sector 1 slow corners
        2: 100,  # Sector 2 tight chicane
        3: 140   # Sector 3 fast corners
    }
    
    expected = expected_min_speeds.get(sector, 120)
    
    if min_speed < expected - 15:  # Significantly slower than expected
        return {
            "issue": "low_corner_speed",
            "severity": "medium",
            "min_speed": min_speed,
            "expected": expected,
            "description": f"Low corner speed in Sector {sector} ({min_speed:.1f} km/h vs expected {expected} km/h)",
            "time_lost": 0.18
        }
    
    return {"issue": None}


def calculate_performance_score(
    actual_time: float,
    predicted_time: float,
    mistakes: List[Dict]
) -> float:
    """
    Calculate overall lap performance score (0-100).
    
    Used to quickly assess lap quality. Higher scores indicate cleaner,
    more optimal laps closer to the car's theoretical potential.
    
    Args:
        actual_time: Actual lap time
        predicted_time: Predicted optimal lap time
        mistakes: List of detected mistakes
    
    Returns:
        Performance score between 0 and 100
    """
    # Base score from time delta
    delta_percent = ((actual_time - predicted_time) / predicted_time) * 100
    time_score = max(0, 100 - (delta_percent * 20))  # Penalize time loss
    
    # Deduct points for mistakes
    mistake_penalty = len(mistakes) * 5  # 5 points per mistake
    severity_penalty = sum(
        10 if m.get("severity") == "high" else 5 if m.get("severity") == "medium" else 2
        for m in mistakes
    )
    
    final_score = max(0, time_score - mistake_penalty - severity_penalty)
    
    return round(final_score, 1)


def generate_feedback(mistakes: List[Dict], tire_info: Dict, delta: float) -> List[str]:
    """
    Generate human-readable feedback for race engineers.
    
    Feedback is concise and actionable, suitable for radio communication
    with the driver or post-session debrief.
    
    Args:
        mistakes: List of detected mistakes
        tire_info: Tire degradation information
        delta: Time delta from predicted optimal
    
    Returns:
        List of feedback strings
    """
    feedback = []
    
    # Overall performance feedback
    if delta < 0.2:
        feedback.append("Excellent lap - very close to optimal time")
    elif delta < 0.5:
        feedback.append("Good lap - minor improvements possible")
    else:
        feedback.append(f"Time loss detected: {delta:.3f}s slower than predicted optimal")
    
    # Mistake-specific feedback
    for mistake in mistakes:
        if mistake.get("issue"):
            feedback.append(mistake["description"])
    
    # Tire feedback
    if tire_info.get("issue") == "tire_degradation":
        feedback.append(tire_info["description"])
        feedback.append("Consider pitting for fresh tires")
    
    return feedback


def analyze_lap(telemetry: List[Dict]) -> Dict:
    """
    Comprehensive lap analysis combining all detection algorithms.
    
    Main analysis function called by the API after telemetry upload.
    Runs all detection algorithms and aggregates results.
    
    Args:
        telemetry: Complete lap telemetry data
    
    Returns:
        Dictionary with complete analysis results
    """
    mistakes = []
    
    # Analyze each sector
    for sector in [1, 2, 3]:
        # Check braking points
        brake_analysis = analyze_braking_points(telemetry, sector)
        if brake_analysis.get("issue"):
            mistakes.append(brake_analysis)
        
        # Check throttle application
        throttle_analysis = analyze_throttle_application(telemetry, sector)
        if throttle_analysis.get("issue"):
            mistakes.append(throttle_analysis)
        
        # Check corner speeds
        corner_analysis = analyze_corner_speed(telemetry, sector)
        if corner_analysis.get("issue"):
            mistakes.append(corner_analysis)
    
    # Analyze tire degradation (lap-wide)
    tire_analysis = analyze_tire_degradation(telemetry)
    if tire_analysis.get("issue"):
        mistakes.append(tire_analysis)
    
    return {
        "mistakes": mistakes,
        "tire_info": tire_analysis
    }
