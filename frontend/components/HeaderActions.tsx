/**
 * Header Actions Component
 * Contains interactive elements for the main header (Add Data, Status)
 */

'use client';

import TelemetryInputForm from './TelemetryInputForm';

export default function HeaderActions() {
    return (
        <div className="flex items-center gap-4">
            {/* Add Data Button - Compact Version for Header */}
            <div className="scale-90 origin-right">
                <TelemetryInputForm />
            </div>

            {/* Live Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-f1-red/10 border border-f1-red/30 rounded-full">
                <div className="w-2 h-2 rounded-full bg-f1-red-bright animate-pulse"></div>
                <span className="text-xs font-mono text-f1-red-bright uppercase tracking-wider">LIVE</span>
            </div>
        </div>
    );
}
