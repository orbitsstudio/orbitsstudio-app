import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running standalone
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
        <span>NEXUS INSTALLED</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-900/50 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0d1527] border border-cyan-500/40 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-sm">Install NEXUS on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="font-mono text-cyan-400 font-bold">1</span>
                  <p>Tap the <strong>Share</strong> icon (box with upward arrow) in the Safari bottom bar.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="font-mono text-cyan-400 font-bold">2</span>
                  <p>Scroll down the share sheet and tap <strong>Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="font-mono text-cyan-400 font-bold">3</span>
                  <p>Confirm by tapping <strong>Add</strong> at the top right to launch NEXUS as an autonomous app.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-slate-800 hover:bg-slate-700 py-2 text-xs font-semibold text-white transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default fallback install button for easy access on Android / Desktop browsers
  return (
    <button
      onClick={() => {
        alert("To install NEXUS on your device:\n\n• On Android Chrome: Tap the browser menu ⋮ and select 'Install app' or 'Add to Home screen'.\n• On Desktop Chrome/Edge: Click the install icon in the URL bar.");
      }}
      className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:border-cyan-500/50 transition cursor-pointer"
    >
      <Download className="w-3.5 h-3.5 text-cyan-400" />
      <span>Install PWA</span>
    </button>
  );
};
