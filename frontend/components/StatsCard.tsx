'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    value: number;
    label: string;
    suffix?: string;
    icon?: LucideIcon;
    delay?: number;
}

export default function StatsCard({ value, label, suffix = '', icon: Icon, delay = 0 }: StatsCardProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            className="group relative"
        >
            <div className="glass-red rounded-lg p-6 border-2 border-f1-red/30 hover:border-f1-red hover:shadow-neon-red transition-all duration-300 card-hover">
                {/* Icon */}
                {Icon && (
                    <div className="mb-3 opacity-70 group-hover:opacity-100 transition">
                        <Icon className="w-10 h-10 text-f1-red-bright" />
                    </div>
                )}

                {/* Number */}
                <div className="flex items-baseline gap-2">
                    <motion.h3
                        className="text-6xl font-racing font-black gradient-text-red stats-number"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: delay + 0.3 }}
                    >
                        {count.toLocaleString()}
                    </motion.h3>
                    {suffix && (
                        <span className="text-2xl text-f1-red-bright font-racing">
                            {suffix}
                        </span>
                    )}
                </div>

                {/* Label */}
                <p className="text-f1-silver font-tech text-sm uppercase tracking-wider mt-2">
                    {label}
                </p>

                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 rounded-lg bg-f1-red opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
            </div>
        </motion.div>
    );
}
