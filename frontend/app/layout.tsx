import type { Metadata } from "next";
import "./globals.css";
import HeaderActions from "@/components/HeaderActions";
import Link from 'next/link';

export const metadata: Metadata = {
    title: "F1 Telemetry Analyzer - Performance Engineering",
    description: "Advanced Formula 1 telemetry analysis system with AI-powered insights",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark scroll-smooth">
            <head>
                <link rel="icon" type="image/png" href="/images/logo.png" />
                <link rel="apple-touch-icon" href="/images/logo.png" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
            </head>
            <body className="antialiased">
                {/* Sticky Red Header */}
                <header className="sticky top-0 z-50 glass-red border-b-2 border-f1-red backdrop-blur-xl">
                    <div className="container mx-auto px-6">
                        <div className="flex items-center justify-between h-20">
                            {/* Logo */}
                            <div className="flex items-center gap-4">
                                <img
                                    src="/images/f1_logo.png"
                                    alt="F1 Logo"
                                    className="h-8 w-auto object-contain"
                                    style={{ filter: 'brightness(0) invert(1)' }}
                                />
                                <div>
                                    <h1 className="text-xl font-racing font-bold text-white tracking-wider">
                                        TELEMETRY ANALYZER
                                    </h1>
                                    <p className="text-xs text-f1-silver font-tech">Performance Engineering</p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="hidden md:flex items-center gap-8">
                                <Link href="/" className="text-f1-silver hover:text-f1-red-bright font-tech uppercase text-sm transition">
                                    Dashboard
                                </Link>
                                <Link href="/input" className="text-f1-silver hover:text-f1-red-bright font-tech uppercase text-sm transition">
                                    Input Data
                                </Link>
                                <Link href="/analysis" className="text-f1-silver hover:text-f1-red-bright font-tech uppercase text-sm transition">
                                    Analysis
                                </Link>
                                <Link href="/laps" className="text-f1-silver hover:text-f1-red-bright font-tech uppercase text-sm transition">
                                    Laps
                                </Link>
                            </nav>

                            {/* Status Indicators */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-f1-red-bright animate-pulse"></div>
                                    <span className="text-xs font-mono text-f1-silver uppercase">LIVE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="min-h-screen">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-bg-red-dark border-t border-f1-red/30 mt-20">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo.png"
                                    alt="F1 Logo"
                                    className="h-10 w-auto object-contain"
                                />
                                <p className="text-f1-silver text-sm font-tech">
                                    © 2026 F1 Telemetry Analyzer • Powered by AI & Blockchain
                                </p>
                            </div>

                            <div className="flex gap-6">
                                <a href="#" className="text-f1-silver hover:text-f1-red text-sm transition">Privacy</a>
                                <a href="#" className="text-f1-silver hover:text-f1-red text-sm transition">Terms</a>
                                <a href="#" className="text-f1-silver hover:text-f1-red text-sm transition">Contact</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
