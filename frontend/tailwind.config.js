import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Red F1 Theme - Primary Colors
                'f1-red': '#E10600',           // Ferrari Red primary
                'f1-red-dark': '#8B0000',      // Dark red
                'f1-red-bright': '#FF1E00',    // Bright accent red
                'f1-red-glow': '#FF4444',      // Glow effect
                'f1-orange': '#FF8700',        // Orange accent

                // Backgrounds
                background: '#0A0A0F',         // Main dark background
                'bg-red-dark': '#1A0505',      // Dark red background
                'bg-surface-red': '#2A0A0A',   // Surface red
                surface: '#1A1A24',            // Card surface

                // Neutrals
                'f1-silver': '#C0C0C8',
                'f1-white': '#FFFFFF',
                'f1-black': '#0A0A0F',
            },
            fontFamily: {
                racing: ['Orbitron', 'sans-serif'],
                tech: ['Rajdhani', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'red-gradient': 'linear-gradient(135deg, #FF0000 0%, #8B0000 100%)',
                'red-gradient-radial': 'radial-gradient(circle, #FF0000 0%, #8B0000 100%)',
                'dark-red-gradient': 'linear-gradient(180deg, #1A0505 0%, #0A0A0F 100%)',
            },
            boxShadow: {
                'neon-red': '0 0 20px rgba(225, 6, 0, 0.5), 0 0 40px rgba(225, 6, 0, 0.3)',
                'neon-red-lg': '0 0 30px rgba(225, 6, 0, 0.6), 0 0 60px rgba(225, 6, 0, 0.4)',
                'glow-red': '0 0 15px rgba(255, 30, 0, 0.5)',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-up': 'slideUp 0.6s ease-out',
                'slide-in-left': 'slideInLeft 0.8s ease-out',
                'slide-in-right': 'slideInRight 0.8s ease-out',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'count-up': 'countUp 1s ease-out',
                'red-shimmer': 'redShimmer 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(225, 6, 0, 0.5)' },
                    '50%': { boxShadow: '0 0 40px rgba(225, 6, 0, 0.8), 0 0 60px rgba(225, 6, 0, 0.5)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                countUp: {
                    '0%': { opacity: '0', transform: 'scale(0.5)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                redShimmer: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
