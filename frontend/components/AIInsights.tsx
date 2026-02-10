'use client';

import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface LapData {
    lap_number: number;
    lap_time?: number;
    speed?: number;
    throttle?: number;
    brake?: number;
}

interface AIInsightsProps {
    lapData: LapData;
}

export default function AIInsights({ lapData }: AIInsightsProps) {
    // Generate AI insights based on lap data
    const generateInsights = () => {
        const insights = [];

        // Speed analysis
        if (lapData.speed) {
            if (lapData.speed > 280) {
                insights.push({
                    type: 'positive',
                    title: 'Excellent Top Speed',
                    message: `Top speed of ${lapData.speed}km/h is competitive. Aerodynamic setup optimized.`,
                    icon: TrendingUp
                });
            } else if (lapData.speed < 240) {
                insights.push({
                    type: 'warning',
                    title: 'Low Top Speed Detected',
                    message: 'Consider reducing downforce for better straight-line performance.',
                    icon: TrendingDown
                });
            }
        }

        // Throttle application
        if (lapData.throttle) {
            if (lapData.throttle > 85) {
                insights.push({
                    type: 'positive',
                    title: 'Aggressive Throttle Application',
                    message: 'Good confidence in traction zones. Maintain this approach.',
                    icon: TrendingUp
                });
            } else if (lapData.throttle < 70) {
                insights.push({
                    type: 'suggestion',
                    title: 'Throttle Optimization',
                    message: 'Room to apply more throttle earlier in corners. Work on traction confidence.',
                    icon: Lightbulb
                });
            }
        }

        // Braking analysis
        if (lapData.brake) {
            if (lapData.brake > 90) {
                insights.push({
                    type: 'warning',
                    title: 'Heavy Braking Detected',
                    message: 'Consider brake point optimization to carry more speed into corners.',
                    icon: AlertCircle
                });
            }
        }

        // Lap time analysis
        if (lapData.lap_time) {
            const lapTimeSeconds = lapData.lap_time / 1000;
            if (lapTimeSeconds < 90) {
                insights.push({
                    type: 'positive',
                    title: 'Competitive Lap Time',
                    message: `${lapTimeSeconds.toFixed(3)}s is strong! Focus on consistency.`,
                    icon: TrendingUp
                });
            } else if (lapTimeSeconds > 95) {
                insights.push({
                    type: 'suggestion',
                    title: 'Lap Time Improvement Opportunity',
                    message: 'Analyze sector times to identify areas for improvement.',
                    icon: Lightbulb
                });
            }
        }

        // Default insight if no specific data
        if (insights.length === 0) {
            insights.push({
                type: 'suggestion',
                title: 'Data Collection Active',
                message: 'Continue recording laps to generate detailed AI insights.',
                icon: Lightbulb
            });
        }

        return insights;
    };

    const insights = generateInsights();

    const getInsightStyles = (type: string) => {
        switch (type) {
            case 'positive':
                return {
                    border: 'border-green-500/50',
                    bg: 'bg-green-500/10',
                    icon: 'text-green-500'
                };
            case 'warning':
                return {
                    border: 'border-yellow-500/50',
                    bg: 'bg-yellow-500/10',
                    icon: 'text-yellow-500'
                };
            case 'suggestion':
            default:
                return {
                    border: 'border-f1-red/50',
                    bg: 'bg-f1-red/10',
                    icon: 'text-f1-red-bright'
                };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm border-2 border-f1-red/20 rounded-lg p-6 shadow-2xl"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-f1-red"></div>
                <h3 className="text-2xl font-racing font-bold text-gray-900">
                    AI PERFORMANCE INSIGHTS
                </h3>
            </div>

            <div className="space-y-4">
                {insights.map((insight, index) => {
                    const styles = getInsightStyles(insight.type);
                    const IconComponent = insight.icon;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border-2 ${styles.border} ${styles.bg}`}
                        >
                            <div className="flex items-start gap-3">
                                <IconComponent className={`w-5 h-5 mt-1 flex-shrink-0 ${styles.icon}`} />
                                <div className="flex-1">
                                    <h4 className="font-racing font-bold text-gray-900 mb-1">
                                        {insight.title}
                                    </h4>
                                    <p className="text-sm text-gray-700 font-tech">
                                        {insight.message}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 font-tech text-center">
                    💡 AI Analysis powered by telemetry data patterns and racing best practices
                </p>
            </div>
        </motion.div>
    );
}
