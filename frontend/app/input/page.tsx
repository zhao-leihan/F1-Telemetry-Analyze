/**
 * Input Form Page - Manual Telemetry Data Entry
 * Full page form (not dialog) for telemetry input
 * WITH BLOCKCHAIN OR DATABASE STORAGE OPTION
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Database, Link as LinkIcon, Save } from 'lucide-react';

export default function InputPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [storageMethod, setStorageMethod] = useState<'database' | 'blockchain'>('database');
    const [formData, setFormData] = useState({
        lap_number: '',
        speed: '',
        throttle: '',
        brake: '',
        gear: '',
        rpm: '',
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            lap_number: parseInt(formData.lap_number) || 0,
            data_points: [{
                timestamp: 0.0,
                lap_number: parseInt(formData.lap_number) || 0,
                speed: parseFloat(formData.speed) || 0,
                throttle: parseFloat(formData.throttle) || 0,
                brake: parseFloat(formData.brake) || 0,
                gear: parseInt(formData.gear) || 0,
                rpm: parseInt(formData.rpm) || 0,
            }]
        };

        try {
            // Choose endpoint based on storage method
            const endpoint = storageMethod === 'blockchain'
                ? 'http://localhost:8000/telemetry/blockchain-input'
                : 'http://localhost:8000/telemetry/manual-input';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Data submitted successfully!', result);

                // Show success message with storage info
                if (storageMethod === 'blockchain' && result.transaction_hash) {
                    alert(`✅ Saved to Blockchain!\nTx Hash: ${result.transaction_hash.substring(0, 20)}...`);
                } else {
                    alert('✅ Saved to Database!');
                }

                router.push('/laps');
            } else {
                console.error('❌ Failed to submit data');
                alert('Failed to submit data');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Network error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0202]">
            {/* Professional Dark Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0202] to-[#1a0505]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a0808]/40 via-transparent to-transparent"></div>
                <img src="/images/bg.jpg" alt="Background" className="w-full h-full object-cover opacity-10 filter grayscale mix-blend-overlay" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-24 relative z-10">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-2 h-16 bg-f1-red-bright"></div>
                        <div>
                            <h1 className="text-5xl font-racing font-bold text-white">
                                MANUAL TELEMETRY INPUT
                            </h1>
                            <p className="text-f1-silver font-tech mt-2">
                                Enter lap data manually for analysis
                            </p>
                        </div>
                    </div>

                    {/* Storage Method Selector */}
                    <div className="mb-6">
                        <div className="bg-white/95 backdrop-blur-sm border-2 border-f1-red/20 rounded-lg p-6">
                            <h3 className="text-xl font-racing text-f1-red mb-4">STORAGE METHOD</h3>
                            <div className="flex gap-4">
                                {/* Database Option */}
                                <button
                                    type="button"
                                    onClick={() => setStorageMethod('database')}
                                    className={`flex-1 px-6 py-4 rounded-lg border-2 font-racing uppercase tracking-wider transition-all ${storageMethod === 'database'
                                        ? 'border-f1-red bg-f1-red text-white shadow-neon-red'
                                        : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-f1-red/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Database className="w-5 h-5" />
                                        <span>Database</span>
                                    </div>
                                    <p className="text-xs mt-1 opacity-80">Firebase / MongoDB</p>
                                </button>

                                {/* Blockchain Option */}
                                <button
                                    type="button"
                                    onClick={() => setStorageMethod('blockchain')}
                                    className={`flex-1 px-6 py-4 rounded-lg border-2 font-racing uppercase tracking-wider transition-all ${storageMethod === 'blockchain'
                                        ? 'border-f1-red bg-f1-red text-white shadow-neon-red'
                                        : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-f1-red/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <LinkIcon className="w-5 h-5" />
                                        <span>Blockchain</span>
                                    </div>
                                    <p className="text-xs mt-1 opacity-80">Immutable Ledger</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* White Container with F1 Logo Background */}
                        <div className="relative bg-white/95 backdrop-blur-sm border-2 border-f1-red/20 rounded-lg p-8 shadow-2xl overflow-hidden">
                            {/* F1 Logo Background Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
                                <img
                                    src="/images/f1_logo.png"
                                    alt="F1 Logo"
                                    className="w-96 h-96 object-contain"
                                />
                            </div>

                            {/* Form Content */}
                            <div className="relative z-10">
                                <h2 className="text-2xl font-racing text-f1-red mb-6">LAP DATA</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Lap Number */}
                                    <div>
                                        <label className="block text-f1-red font-tech text-sm uppercase mb-2 font-bold">
                                            Lap Number
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.lap_number}
                                            onChange={(e) => updateField('lap_number', e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-300 rounded px-4 py-3 text-gray-900 font-racing text-lg focus:outline-none focus:border-f1-red focus:ring-2 focus:ring-f1-red/50"
                                            min="1"
                                            placeholder="Enter lap number"
                                            required
                                        />
                                    </div>

                                    {/* Speed */}
                                    <div>
                                        <label className="block text-f1-red font-tech text-sm uppercase mb-2 font-bold">
                                            Speed (km/h)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.speed}
                                            onChange={(e) => updateField('speed', e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-300 rounded px-4 py-3 text-gray-900 font-racing text-lg focus:outline-none focus:border-f1-red focus:ring-2 focus:ring-f1-red/50"
                                            min="0"
                                            max="400"
                                            step="0.1"
                                            placeholder="e.g. 250"
                                            required
                                        />
                                    </div>

                                    {/* Throttle */}
                                    <div>
                                        <label className="block text-f1-red font-tech text-sm uppercase mb-2 font-bold">
                                            Throttle (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.throttle}
                                            onChange={(e) => updateField('throttle', e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-300 rounded px-4 py-3 text-gray-900 font-racing text-lg focus:outline-none focus:border-f1-red focus:ring-2 focus:ring-f1-red/50"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            placeholder="e.g. 85"
                                            required
                                        />
                                    </div>

                                    {/* Brake */}
                                    <div>
                                        <label className="block text-f1-red font-tech text-sm uppercase mb-2 font-bold">
                                            Brake (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.brake}
                                            onChange={(e) => updateField('brake', e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-300 rounded px-4 py-3 text-gray-900 font-racing text-lg focus:outline-none focus:border-f1-red focus:ring-2 focus:ring-f1-red/50"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            placeholder="e.g. 0"
                                            required
                                        />
                                    </div>

                                    {/* Gear */}
                                    <div>
                                        <label className="block text-f1-red font-tech text-sm uppercase mb-2 font-bold">
                                            Gear
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.gear}
                                            onChange={(e) => updateField('gear', e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-300 rounded px-4 py-3 text-gray-900 font-racing text-lg focus:outline-none focus:border-f1-red focus:ring-2 focus:ring-f1-red/50"
                                            min="1"
                                            max="8"
                                            placeholder="e.g. 7"
                                            required
                                        />
                                    </div>

                                    {/* RPM */}
                                    <div>
                                        <label className="block text-f1-red font-tech text-sm uppercase mb-2 font-bold">
                                            RPM
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.rpm}
                                            onChange={(e) => updateField('rpm', e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-300 rounded px-4 py-3 text-gray-900 font-racing text-lg focus:outline-none focus:border-f1-red focus:ring-2 focus:ring-f1-red/50"
                                            min="0"
                                            max="15000"
                                            step="100"
                                            placeholder="e.g. 11000"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 items-center justify-end">
                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="px-8 py-4 bg-black/40 border border-white/20 text-white rounded-lg font-racing uppercase tracking-wider hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-red-glow px-12 py-4 text-white rounded-lg font-racing shadow-neon-red hover-scale uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                                        SUBMITTING...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>{storageMethod === 'blockchain' ? 'SAVE TO BLOCKCHAIN' : 'SAVE TO DATABASE'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
