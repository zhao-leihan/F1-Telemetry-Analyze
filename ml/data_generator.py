"""
Synthetic F1 telemetry data generator.

Generates realistic telemetry data that mimics real F1 patterns including:
- Sector-based performance variations
- Tire degradation effects over multiple laps
- Track temperature impact on grip
- Realistic speed/throttle/brake correlations
- Compound-specific tire behavior

Used for testing the system and training ML models without real car data.
"""

import numpy as np
import random
from typing import List, Dict
import json


class F1TelemetryGenerator:
    """
    Generates synthetic F1 telemetry data with realistic patterns.
    
    Simulates a track with 3 sectors, each with different characteristics:
    - Sector 1: High-speed straights with heavy braking zones
    - Sector 2: Technical slow-speed corners (chicanes)
    - Sector 3: Fast sweeping corners
    """
    
    def __init__(self, base_lap_time: float = 88.5):
        """
        Initialize generator with baseline lap time.
        
        Args:
            base_lap_time: Target lap time in seconds (default: 88.5s)
        """
        self.base_lap_time = base_lap_time
        self.sector_duration_ratio = [0.33, 0.34, 0.33]  # Sector time distribution
        
        # Tire degradation rates (% wear per lap)
        self.tire_degradation_rates = {
            'soft': 1.8,    # Degrades quickly but fast initially
            'medium': 1.2,  # Balanced degradation
            'hard': 0.8     # Durable but slower
        }
        
        # Base lap time adjustment per compound
        self.compound_advantage = {
            'soft': -0.6,   # 0.6s faster than medium
            'medium': 0.0,  # Baseline
            'hard': 0.4     # 0.4s slower than medium
        }
    
    def generate_lap(
        self,
        lap_number: int,
        tire_compound: str = 'soft',
        tire_age: int = 0,
        track_temperature: float = 42.0,
        driver_error: bool = False
    ) -> List[Dict]:
        """
        Generate complete telemetry data for a single lap.
        
        Args:
            lap_number: Lap number in session
            tire_compound: Tire type (soft/medium/hard)
            tire_age: Number of laps completed on these tires
            track_temperature: Track temp in Celsius
            driver_error: If True, inject driving mistakes
        
        Returns:
            List of telemetry data points (dict format ready for API)
        """
        telemetry = []
        
        # Calculate tire wear based on age and compound
        tire_wear = min(100, tire_age * self.tire_degradation_rates[tire_compound])
        
        # Calculate lap time with all factors
        lap_time = self._calculate_lap_time(
            tire_compound, tire_wear, track_temperature, driver_error
        )
        
        # Generate telemetry for each sector
        sector_times = self._distribute_lap_time(lap_time)
        current_time = 0.0
        
        for sector in range(1, 4):
            sector_duration = sector_times[sector - 1]
            sector_telemetry = self._generate_sector_telemetry(
                sector=sector,
                start_time=current_time,
                duration=sector_duration,
                lap_number=lap_number,
                tire_compound=tire_compound,
                tire_wear=tire_wear,
                track_temperature=track_temperature,
                inject_error=driver_error and sector == 2  # Errors in sector 2
            )
            telemetry.extend(sector_telemetry)
            current_time += sector_duration
        
        # Set lap time on final data point
        if telemetry:
            telemetry[-1]['lap_time'] = round(lap_time, 3)
        
        return telemetry
    
    def _calculate_lap_time(
        self,
        tire_compound: str,
        tire_wear: float,
        track_temperature: float,
        driver_error: bool
    ) -> float:
        """Calculate realistic lap time based on conditions."""
        lap_time = self.base_lap_time
        
        # Tire compound effect
        lap_time += self.compound_advantage[tire_compound]
        
        # Tire wear effect (0.01s per % wear)
        lap_time += tire_wear * 0.01
        
        # Track temperature effect (optimal around 40-45°C)
        temp_delta = abs(track_temperature - 42.5)
        lap_time += temp_delta * 0.02
        
        # Driver error adds 0.3-0.8s
        if driver_error:
            lap_time += random.uniform(0.3, 0.8)
        
        # Random variance (±0.2s)
        lap_time += random.uniform(-0.2, 0.2)
        
        return lap_time
    
    def _distribute_lap_time(self, lap_time: float) -> List[float]:
        """Distribute lap time across sectors."""
        return [lap_time * ratio for ratio in self.sector_duration_ratio]
    
    def _generate_sector_telemetry(
        self,
        sector: int,
        start_time: float,
        duration: float,
        lap_number: int,
        tire_compound: str,
        tire_wear: float,
        track_temperature: float,
        inject_error: bool = False
    ) -> List[Dict]:
        """
        Generate telemetry data points for a sector.
        
        Simulates realistic speed, throttle, brake, and steering traces.
        """
        # Sample at 10Hz (100ms intervals) for manageable data size
        sample_rate = 10  # Hz
        num_samples = int(duration * sample_rate)
        
        telemetry = []
        
        # Sector-specific characteristics
        sector_profiles = {
            1: {'max_speed': 340, 'min_speed': 120, 'brake_zones': 2},
            2: {'max_speed': 280, 'min_speed': 90, 'brake_zones': 3},  # Technical
            3: {'max_speed': 320, 'min_speed': 140, 'brake_zones': 2}   # Fast corners
        }
        
        profile = sector_profiles[sector]
        
        for i in range(num_samples):
            timestamp = start_time + (i / sample_rate)
            progress = i / num_samples  # 0 to 1
            
            # Generate realistic speed trace
            speed = self._generate_speed(progress, profile, inject_error and i > num_samples // 2)
            
            # Generate throttle based on speed profile
            throttle = self._generate_throttle(progress, profile)
            
            # Generate brake input
            brake = self._generate_brake(progress, profile, inject_error)
            
            # Generate steering angle
            steering = self._generate_steering(progress, sector)
            
            # Generate gear based on speed
            gear = self._speed_to_gear(speed)
            
            data_point = {
                'lap_number': lap_number,
                'sector': sector,
                'timestamp': round(timestamp, 3),
                'speed': round(speed, 1),
                'throttle': round(throttle, 1),
                'brake': round(brake, 1),
                'steering_angle': round(steering, 1),
                'gear': gear,
                'tire_compound': tire_compound,
                'tire_wear': round(tire_wear, 1),
                'track_temperature': round(track_temperature, 1),
                'lap_time': None  # Set on last point only
            }
            
            telemetry.append(data_point)
        
        return telemetry
    
    def _generate_speed(self, progress: float, profile: Dict, error: bool) -> float:
        """Generate realistic speed trace with acceleration and braking zones."""
        max_speed = profile['max_speed']
        min_speed = profile['min_speed']
        
        # Create speed profile with braking zones
        # Typically: accelerate -> brake -> corner -> accelerate
        if progress < 0.3:
            # Acceleration phase
            speed = min_speed + (max_speed - min_speed) * (progress / 0.3)
        elif progress < 0.5:
            # Braking zone
            speed = max_speed - (max_speed - min_speed) * ((progress - 0.3) / 0.2)
            if error:
                speed -= 10  # Late braking = lower minimum speed
        elif progress < 0.7:
            # Corner/apex
            speed = min_speed + random.uniform(-5, 5)
        else:
            # Exit acceleration
            speed = min_speed + (max_speed - min_speed) * ((progress - 0.7) / 0.3)
        
        return max(0, speed + random.uniform(-3, 3))  # Small noise
    
    def _generate_throttle(self, progress: float, profile: Dict) -> float:
        """Generate throttle application based on track position."""
        if progress < 0.3:
            # Full throttle on straight
            return 95 + random.uniform(0, 5)
        elif progress < 0.5:
            # Lift for braking
            return random.uniform(0, 10)
        elif progress < 0.7:
            # Partial throttle through corner
            return random.uniform(30, 60)
        else:
            # Aggressive exit
            return 85 + random.uniform(0, 15)
    
    def _generate_brake(self, progress: float, profile: Dict, error: bool) -> float:
        """Generate brake pressure based on track position."""
        if 0.3 <= progress < 0.5:
            # Braking zone
            peak_brake = 100 if not error else 90  # Error = less confident braking
            brake_value = peak_brake - abs((progress - 0.4) / 0.1) * 30 + random.uniform(-5, 5)
            return min(100.0, max(0.0, brake_value))  # Clamp to 0-100 range
        else:
            return 0.0
    
    def _generate_steering(self, progress: float, sector: int) -> float:
        """Generate steering angle based on sector and position."""
        # Sector 2 has tighter corners (higher steering angles)
        max_angle = 180 if sector == 2 else 120
        
        # More steering in corner phases (0.4-0.8)
        if 0.4 <= progress < 0.8:
            return random.uniform(-max_angle, max_angle)
        else:
            # Straights have minimal steering
            return random.uniform(-20, 20)
    
    def _speed_to_gear(self, speed: float) -> int:
        """Convert speed to appropriate gear."""
        if speed < 80:
            return 2
        elif speed < 120:
            return 3
        elif speed < 160:
            return 4
        elif speed < 200:
            return 5
        elif speed < 250:
            return 6
        elif speed < 300:
            return 7
        else:
            return 8


def generate_session_data(num_laps: int = 20, output_file: str = None) -> List[Dict]:
    """
    Generate a full session of telemetry data.
    
    Simulates a realistic session with tire strategy:
    - Laps 1-8: Soft tires
    - Laps 9-20: Medium tires (after pit stop)
    
    Args:
        num_laps: Number of laps to generate
        output_file: Optional file path to save JSON output
    
    Returns:
        List of all telemetry data points
    """
    generator = F1TelemetryGenerator(base_lap_time=88.5)
    all_telemetry = []
    
    print(f"🏎️  Generating {num_laps} laps of F1 telemetry data...")
    
    for lap in range(1, num_laps + 1):
        # Tire strategy simulation
        if lap <= 8:
            tire_compound = 'soft'
            tire_age = lap - 1
        else:
            tire_compound = 'medium'
            tire_age = lap - 9
        
        # Track temperature varies slightly
        track_temp = 42.0 + random.uniform(-3, 3)
        
        # Inject driver error occasionally (10% of laps)
        driver_error = random.random() < 0.1
        
        lap_data = generator.generate_lap(
            lap_number=lap,
            tire_compound=tire_compound,
            tire_age=tire_age,
            track_temperature=track_temp,
            driver_error=driver_error
        )
        
        all_telemetry.extend(lap_data)
        
        # Get lap time from last data point
        lap_time = lap_data[-1]['lap_time']
        status = "⚠️  ERROR" if driver_error else "✓"
        print(f"  Lap {lap:2d}: {lap_time:.3f}s on {tire_compound:6s} tires (age: {tire_age}) {status}")
    
    print(f"\n✅ Generated {len(all_telemetry)} total data points")
    
    # Save to file if specified
    if output_file:
        with open(output_file, 'w') as f:
            json.dump(all_telemetry, f, indent=2)
        print(f"💾 Data saved to {output_file}")
    
    return all_telemetry


if __name__ == "__main__":
    # Generate sample data
    output_path = "sample_telemetry.json"
    data = generate_session_data(num_laps=25, output_file=output_path)
    
    print(f"\n📊 Sample data point:")
    print(json.dumps(data[0], indent=2))
