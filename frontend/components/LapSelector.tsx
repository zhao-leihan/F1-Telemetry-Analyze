/**
 * Lap Selector - F1 Racing HUD Style
 * 
 * Radix UI Select component with F1 theme
 */

import * as Select from '@radix-ui/react-select';
import { LapSummary } from '@/types/telemetry';

interface LapSelectorProps {
    laps: LapSummary[];
    selectedLap: number | null;
    onSelectLap: (lapNumber: number) => void;
}

export default function LapSelector({ laps, selectedLap, onSelectLap }: LapSelectorProps) {
    return (
        <div className="bg-surface rounded-lg p-6 border-2 border-f1-green/30 shadow-neon-green">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-f1-green"></div>
                    <h2 className="text-2xl font-racing text-white tracking-wider">LAP SELECTION</h2>
                </div>
                <div className="px-4 py-2 bg-f1-green/20 border border-f1-green rounded">
                    <span className="text-f1-green font-mono font-bold text-sm">
                        {laps.length} LAPS
                    </span>
                </div>
            </div>

            <Select.Root
                value={selectedLap?.toString()}
                onValueChange={(v) => onSelectLap(parseInt(v))}
            >
                <Select.Trigger className="w-full bg-background border-2 border-f1-silver/30 rounded px-5 py-4 text-white font-tech text-lg hover:border-f1-green transition-all focus:outline-none focus:border-f1-green focus:shadow-neon-green flex items-center justify-between">
                    <Select.Value placeholder="Select a lap..." />
                    <Select.Icon>
                        <svg className="w-5 h-5 text-f1-silver" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                    <Select.Content className="bg-surface border-2 border-f1-green rounded-lg shadow-neon-green overflow-hidden z-50">
                        <Select.Viewport>
                            {laps.map((lap) => (
                                <Select.Item
                                    key={lap.lap_number}
                                    value={lap.lap_number.toString()}
                                    className="px-5 py-4 cursor-pointer hover:bg-f1-green/20 text-white font-mono border-b border-f1-silver/10 last:border-0 focus:outline-none focus:bg-f1-green/30 transition"
                                >
                                    <Select.ItemText>
                                        <div className="flex items-center justify-between gap-8">
                                            <span className="font-racing text-f1-green">LAP {lap.lap_number}</span>
                                            <span className="text-f1-silver">{lap.lap_time || '---'}s</span>
                                        </div>
                                    </Select.ItemText>
                                </Select.Item>
                            ))}
                        </Select.Viewport>
                    </Select.Content>
                </Select.Portal>
            </Select.Root>
        </div>
    );
}
