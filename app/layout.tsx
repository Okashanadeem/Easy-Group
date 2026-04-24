import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Easy-Group | HQ Core",
  description: "Advanced Team Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased bg-[#020617] text-slate-200 min-h-screen font-sans`}
      >
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20"></div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header / Navbar with Badge */}
          <header className="border-b border-hq-border bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-hq-blue/10 flex items-center justify-center border border-hq-blue/30 group-hover:border-hq-blue/60 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-hq-blue animate-pulse" />
                </div>
                <span className="font-outfit font-black text-lg tracking-tighter text-white">EASY<span className="text-hq-blue">GROUP</span></span>
              </Link>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-hq-border bg-white/5 rounded-full">
                  <Award className="w-3.5 h-3.5 text-hq-blue" />
                  <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">Product of CAMS</span>
                </div>
                <div className="h-4 w-[1px] bg-hq-border hidden md:block" />
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[9px] text-slate-500 uppercase tracking-tighter">System: Active</span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          {/* Stylized Footer */}
          <footer className="border-t border-hq-border py-16 bg-[#020617]/50 relative overflow-hidden mt-20">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-hq-blue/20 to-transparent" />
            
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col items-center justify-center gap-8 text-center">
                <div className="space-y-3">
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]">
                    Easy-Group Management Protocol // HQ CORE
                  </p>
                  <p className="font-outfit text-sm text-white uppercase tracking-widest font-bold">
                    System managed and designed by CR of the section 
                    <span className="text-hq-blue ml-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">Okasha Nadeem</span>
                  </p>
                </div>
                
                <Link 
                  href="https://linkedin.com/in/okasha-nadeem" 
                  target="_blank"
                  className="group flex items-center gap-3 px-8 py-4 bg-white/5 border border-hq-border hover:border-hq-blue/50 transition-all rounded-2xl backdrop-blur-sm"
                >
                  <ExternalLink className="w-4 h-4 text-hq-blue group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest group-hover:text-white transition-colors">Connect via LinkedIn</span>
                </Link>

                <div className="flex items-center gap-6 opacity-30">
                  <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-slate-500" />
                  <div className="w-2 h-2 rounded-full bg-hq-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-slate-500" />
                </div>
                
                <p className="font-mono text-[9px] text-slate-600 uppercase tracking-[0.6em]">
                  All rights reserved • © 2026 EASY-GROUP SYSTEMS
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
