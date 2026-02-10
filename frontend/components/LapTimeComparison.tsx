/**
 * Lap time comparison component.
 * 
 * Visualizes the delta between actual and predicted lap times,
 * helping engineers understand if the driver is extracting
 * maximum performance from the car.
 */

import { LapAnalysis } from '@/types/telemetry';

interface LapTimeComparisonProps {
    analysis: LapAnalysis;
}

export default function LapTimeComparison({ analysis }: LapTimeComparisonProps) {
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toFixed(3).padStart(6, '0')}`;
    };

    const deltaPercentage = (analysis.delta / analysis.predicted_lap_time) * 100;
    const isSlower = analysis.delta > 0;

    return (
        <div className="bg-f1-grey rounded-lg p-6 border border-f1-red/30">
            <h3 className="text-lg font-bold text-white mb-6">Lap Time Analysis</h3>

            {/* Actual vs Predicted */}
            <div className="space-y-4 mb-6">
                {/* Actual Time */}
                <div className="bg-f1-black p-4 rounded-lg border border-f1-red/20">
                    <p className="text-xs text-f1-silver mb-1 uppercase tracking-wide">Actual Lap Time</p>
                    <p className="text-3xl font-bold font-mono text-white">
                        {formatTime(analysis.actual_lap_time)}
                    </p>
                </div>

                {/* Predicted Time */}
                <div className="bg-f1-black p-4 rounded-lg border border-f1-red/20">
                    <p className="text-xs text-f1-silver mb-1 uppercase tracking-wide">
                        Predicted Optimal Time
                    </p>
                    <p className="text-3xl font-bold font-mono text-blue-400">
                        {formatTime(analysis.predicted_lap_time)}
                    </p>
                    <p className="text-xs text-f1-silver/70 mt-2">
                        Based on AI model analysis
                    </p>
                </div>

                {/* Delta */}
                <div className={`p-4 rounded-lg border-2 ${isSlower
                        ? 'bg-red-900/20 border-red-500'
                        : 'bg-green-900/20 border-green-500'
                    }`}>
                    <p className="text-xs text-f1-silver mb-1 uppercase tracking-wide">Delta</p>
                    <div className="flex items-baseline justify-between">
                        <p className={`text-4xl font-bold font-mono ${isSlower ? 'text-red-400' : 'text-green-400'
                            }`}>
                            {isSlower ? '+' : ''}{analysis.delta.toFixed(3)}s
                        </p>
                        <p className={`text-xl font-semibold ${isSlower ? 'text-red-400' : 'text-green-400'
                            }`}>
                            {deltaPercentage.toFixed(2)}%
                        </p>
                    </div>
                    <p className={`text-sm mt-2 ${isSlower ? 'text-red-300' : 'text-green-300'
                        }`}>
                        {isSlower
                            ? 'Slower than predicted optimal'
                            : 'Faster than predicted optimal!'}
                    </p>
                </div>
            </div>

            {/* Sector Breakdown */}
            {analysis.sector_times && Object.keys(analysis.sector_times).length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-f1-silver mb-3 uppercase tracking-wide">
                        Sector Breakdown
                    </h4>
                    <div className="space-y-2">
                        {[1, 2, 3].map(sector => {
                            const time = analysis.sector_times[sector];
                            if (!time) return null;

                            return (
                                <div key={sector} className="bg-f1-black p-3 rounded-lg border border-f1-red/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-f1-silver">Sector {sector}</span>
                                        </div>
                                        <span className="text-lg font-bold font-mono text-white">
                                            {time.toFixed(3)}s
                                        </span>
                                    </div>
                                    {/* Visual bar */}
                                    <div className="mt-2 h-1 bg-f1-grey rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-f1-red"
                                            style={{
                                                width: `${(time / Math.max(...Object.values(analysis.sector_times))) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Performance Indicator */}
            <div className="mt-6 pt-6 border-t border-f1-red/20">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-f1-silver">Overall Assessment:</span>
                    <span className={`text-sm font-semibold ${analysis.performance_score >= 90 ? 'text-green-400' :
                            analysis.performance_score >= 75 ? 'text-yellow-400' :
                                'text-red-400'
                        }`}>
                        {analysis.performance_score >= 90 ? 'Excellent 🏆' :
                            analysis.performance_score >= 75 ? 'Good 👍' :
                                'Needs Improvement 📈'}
                    </span>
                </div>
            </div>
        </div>
    );
}
