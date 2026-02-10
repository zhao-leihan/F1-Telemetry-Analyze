/**
 * Status LED Indicator - F1 Racing Style
 * 
 * Displays system status with animated LED lights
 */

interface StatusLEDProps {
    label: string
    status: 'active' | 'inactive' | 'warning'
}

export default function StatusLED({ label, status }: StatusLEDProps) {
    const colors = {
        active: 'bg-f1-green shadow-neon-green',
        inactive: 'bg-gray-600',
        warning: 'bg-f1-orange shadow-neon-orange',
    }

    return (
        <div className="flex items-center gap-2">
            <div
                className={`w-3 h-3 rounded-full ${colors[status]} ${status === 'active' ? 'animate-pulse-fast' : ''
                    }`}
            />
            <span className="text-xs font-mono text-f1-silver uppercase tracking-wider">
                {label}
            </span>
        </div>
    )
}
