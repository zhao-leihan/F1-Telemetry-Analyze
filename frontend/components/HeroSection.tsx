/**
 * Hero Section - Ferrari SF-24 Focus
 * Centered car with floating telemetry data points
 */

'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
    return (
        <section className="relative min-h-[80vh] overflow-hidden bg-transparent flex items-center mb-16">
            {/* Main Content Container */}
            <div className="container mx-auto px-6 relative z-10 flex items-center justify-center">

                <div className="relative w-full max-w-6xl">
                    {/* SCUDERIA FERRARI Text Above Car */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        <h2 className="text-5xl md:text-6xl font-racing font-bold text-white mb-2">
                            SCUDERIA
                        </h2>
                        <h2 className="text-6xl md:text-7xl font-racing font-black text-f1-red-bright">
                            FERRARI
                        </h2>
                        <div className="h-1 w-32 bg-white/30 mx-auto mt-4"></div>
                    </motion.div>

                    {/* Car Image Container - Full Width Centered */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full"
                    >
                        <img
                            src="/images/car_final.png"
                            alt="Ferrari SF-24"
                            className="w-full drop-shadow-2xl z-10 relative"
                        />

                        {/* FLOATING DATA POINTS */}

                        {/* Front Wing Aero */}
                        <div className="absolute bottom-20 left-10 z-30 animate-fade-in-up">
                            <div className="flex flex-col items-center">
                                <div className="glass-red px-4 py-2 rounded border border-f1-red/50 shadow-neon-red mb-2">
                                    <p className="text-xs text-f1-silver uppercase">Front Downforce</p>
                                    <p className="text-xl font-racing text-white">2450 <span className="text-xs">kg</span></p>
                                </div>
                                <div className="w-1 h-10 bg-f1-red-bright"></div>
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                        </div>

                        {/* Engine Temp */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-20 z-30 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-white mb-2"></div>
                                <div className="w-1 h-10 bg-f1-red-bright mb-2"></div>
                                <div className="glass-red px-4 py-2 rounded border border-f1-red/50 shadow-neon-red">
                                    <p className="text-xs text-f1-silver uppercase">Engine Temp</p>
                                    <p className="text-xl font-racing text-white">115°C <span className="text-xs">OK</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Rear Wing DRS */}
                        <div className="absolute top-20 right-20 z-30 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <div className="flex flex-col items-center">
                                <div className="glass-red px-4 py-2 rounded border border-f1-red/50 shadow-neon-red mb-2">
                                    <p className="text-xs text-f1-silver uppercase">Rear DRS</p>
                                    <p className="text-xl font-racing text-white">CLOSED</p>
                                </div>
                                <div className="w-1 h-10 bg-f1-red-bright"></div>
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                        </div>

                        {/* Tyre Wear */}
                        <div className="absolute bottom-10 right-40 z-30 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                            <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-white mb-2"></div>
                                <div className="w-1 h-8 bg-f1-red-bright mb-2"></div>
                                <div className="glass-red px-4 py-2 rounded border border-f1-red/50 shadow-neon-red">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                        <div>
                                            <p className="text-xs text-f1-silver uppercase">Tyre Wear</p>
                                            <p className="text-xl font-racing text-white">85%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}
