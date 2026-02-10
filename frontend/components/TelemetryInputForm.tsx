/**
 * Telemetry Input Form - F1 Theme
 * 
 * Manual data input form with Radix UI Dialog
 * Allows users to submit telemetry data from the web interface
 */

'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Toast from '@radix-ui/react-toast';

export default function TelemetryInputForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [formData, setFormData] = useState({
        lap_number: 1,
        timestamp: 0,
        speed: 0,
        throttle: 0,
        brake: 0,
        gear: 1,
        track_position: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:8000/telemetry/manual-input', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lap_number: formData.lap_number,
                    data_points: [formData]
                })
            });

            if (!response.ok) throw new Error('Submission failed');

            const result = await response.json();
            console.log('Submitted:', result);

            setToastMessage(`✅ Lap ${formData.lap_number} data saved and analyzed!`);
            setShowToast(true);
            setIsOpen(false);

            // Reset form
            setFormData(prev => ({ ...prev, lap_number: prev.lap_number + 1 }));

            // Refresh page to show new data
            setTimeout(() => window.location.reload(), 1500);

        } catch (error) {
            console.error('Submission error:', error);
            setToastMessage('❌ Failed to submit data');
            setShowToast(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateField = (field: string, value: number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Toast.Provider>
            <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
                <Dialog.Trigger asChild>
                    <button
                        onClick={() => {
                            console.log('🔴 BUTTON CLICKED! Opening dialog...');
                            setIsOpen(true);
                        }}
                        className="btn-red-glow px-8 py-4 text-white rounded-lg font-racing shadow-neon-red hover-scale uppercase tracking-wider cursor-pointer relative z-[99999]"
                        style={{ pointerEvents: 'auto' }}
                    >
                        + ADD LAP DATA
                    </button>
                </Dialog.Trigger>

                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-md z-40" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-red border-2 border-f1-red rounded-lg p-8 w-full max-w-3xl shadow-neon-red-lg z-50 max-h-[90vh] overflow-y-auto animate-slide-up">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-10 bg-f1-red"></div>
                            <Dialog.Title className="text-3xl font-racing text-white tracking-wider">
                                MANUAL TELEMETRY INPUT
                            </Dialog.Title>
                        </div>

                        <Dialog.Description className="text-f1-silver font-tech mb-8">
                            Enter telemetry data manually for lap analysis. Data will be saved to MongoDB and analyzed automatically.
                        </Dialog.Description>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Lap Number */}
                            <div>
                                <label className="block text-f1-silver font-mono text-sm mb-2">Lap Number</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.lap_number}
                                    onChange={(e) => updateField('lap_number', parseInt(e.target.value))}
                                    className="w-full bg-background border-2 border-f1-silver/30 rounded px-4 py-3 text-white font-tech focus:outline-none focus:border-f1-green transition"
                                    required
                                />
                            </div>

                            {/* Speed & Throttle */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-f1-silver font-mono text-sm mb-2">Speed (km/h)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="400"
                                        step="0.1"
                                        value={formData.speed}
                                        onChange={(e) => updateField('speed', parseFloat(e.target.value))}
                                        className="w-full bg-background border-2 border-f1-silver/30 rounded px-4 py-3 text-white font-tech focus:outline-none focus:border-f1-green transition"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-f1-silver font-mono text-sm mb-2">Throttle (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={formData.throttle}
                                        onChange={(e) => updateField('throttle', parseFloat(e.target.value))}
                                        className="w-full bg-background border-2 border-f1-silver/30 rounded px-4 py-3 text-white font-tech focus:outline-none focus:border-f1-green transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Brake & Gear */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-f1-silver font-mono text-sm mb-2">Brake (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={formData.brake}
                                        onChange={(e) => updateField('brake', parseFloat(e.target.value))}
                                        className="w-full bg-background border-2 border-f1-silver/30 rounded px-4 py-3 text-white font-tech focus:outline-none focus:border-f1-green transition"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-f1-silver font-mono text-sm mb-2">Gear</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="8"
                                        value={formData.gear}
                                        onChange={(e) => updateField('gear', parseInt(e.target.value))}
                                        className="w-full bg-background border-2 border-f1-silver/30 rounded px-4 py-3 text-white font-tech focus:outline-none focus:border-f1-green transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Timestamp & Track Position */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-f1-silver font-mono text-sm mb-2">Timestamp (s)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.001"
                                        value={formData.timestamp}
                                        onChange={(e) => updateField('timestamp', parseFloat(e.target.value))}
                                        className="w-full bg-background border-2 border-f1-silver/30 rounded px-4 py-3 text-white font-tech focus:outline-none focus:border-f1-green transition"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-f1-silver font-mono text-sm mb-2">Track Position (m)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={formData.track_position}
                                        onChange={(e) => updateField('track_position', parseFloat(e.target.value))}
                                        className="w-full bg-background border-2 border-f1-silver/30 rounded px-4 py-3 text-white font-tech focus:outline-none focus:border-f1-green transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 mt-8">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 btn-red-glow text-white py-4 rounded-lg font-racing uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT & ANALYZE'}
                                </button>

                                <Dialog.Close asChild>
                                    <button
                                        type="button"
                                        className="px-8 bg-f1-silver/20 text-f1-silver py-4 rounded-lg font-tech hover:bg-f1-silver/30 transition"
                                    >
                                        CANCEL
                                    </button>
                                </Dialog.Close>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Toast Notification */}
            <Toast.Root
                open={showToast}
                onOpenChange={setShowToast}
                className="bg-surface border-2 border-f1-green rounded-lg p-6 shadow-neon-green"
            >
                <Toast.Description className="text-white font-tech">
                    {toastMessage}
                </Toast.Description>
            </Toast.Root>
            <Toast.Viewport className="fixed bottom-8 right-8 z-50" />
        </Toast.Provider>
    );
}
