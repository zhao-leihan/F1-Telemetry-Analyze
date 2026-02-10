/**
 * Analysis feedback component displaying AI-generated insights.
 * 
 * Shows human-readable feedback from the telemetry analysis algorithms,
 * formatted for quick comprehension by race engineers.
 */

import { LapAnalysis } from '@/types/telemetry';

interface AnalysisFeedbackProps {
    analysis: LapAnalysis;
}

export default function AnalysisFeedback({ analysis }: AnalysisFeedbackProps) {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'text-red-400 bg-red-900/30 border-red-500';
            case 'medium':
                return 'text-yellow-400 bg-yellow-900/30 border-yellow-500';
            case 'low':
                return 'text-blue-400 bg-blue-900/30 border-blue-500';
            default:
                return 'text-f1-silver bg-f1-black border-f1-grey';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return '🔴';
            case 'medium':
                return '🟡';
            case 'low':
                return '🔵';
            default:
                return '⚪';
        }
    };

    return (
        <div className="bg-f1-grey rounded-lg p-6 border border-f1-red/30">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">AI Analysis</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${analysis.performance_score >= 90 ? 'bg-green-900/30 text-green-400 border border-green-500' :
                        analysis.performance_score >= 75 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500' :
                            'bg-red-900/30 text-red-400 border border-red-500'
                    }`}>
                    Score: {analysis.performance_score.toFixed(1)}
                </div>
            </div>

            {/* General Feedback */}
            <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-f1-silver uppercase tracking-wide">
                    Race Engineer Feedback
                </h4>
                {analysis.feedback && analysis.feedback.length > 0 ? (
                    analysis.feedback.map((feedback, index) => (
                        <div
                            key={index}
                            className="bg-f1-black p-3 rounded-lg border border-f1-red/20"
                        >
                            <p className="text-sm text-f1-silver leading-relaxed">
                                💬 {feedback}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-f1-silver/50 italic">No feedback available</p>
                )}
            </div>

            {/* Detected Mistakes */}
            {analysis.mistakes_detected && analysis.mistakes_detected.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-f1-silver uppercase tracking-wide">
                        Detected Issues ({analysis.mistakes_detected.length})
                    </h4>
                    <div className="space-y-2">
                        {analysis.mistakes_detected.map((mistake, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border ${getSeverityColor(mistake.severity)}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span>{getSeverityIcon(mistake.severity)}</span>
                                        <span className="font-semibold text-sm uppercase">
                                            Sector {mistake.sector}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold">
                                        -{mistake.time_lost.toFixed(3)}s
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed">
                                    {mistake.description}
                                </p>
                                <div className="mt-2 pt-2 border-t border-white/10">
                                    <span className="text-xs opacity-75">
                                        Type: {mistake.type.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Time Lost */}
                    <div className="mt-4 p-3 bg-f1-black rounded-lg border border-f1-red/30">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-f1-silver">Total Estimated Time Lost:</span>
                            <span className="text-xl font-bold text-red-400">
                                {analysis.mistakes_detected
                                    .reduce((sum, m) => sum + m.time_lost, 0)
                                    .toFixed(3)}s
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* No Issues Detected */}
            {(!analysis.mistakes_detected || analysis.mistakes_detected.length === 0) && (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-green-400 font-semibold">Clean Lap</p>
                    <p className="text-sm text-green-400/70 mt-1">No major issues detected</p>
                </div>
            )}
        </div>
    );
}
