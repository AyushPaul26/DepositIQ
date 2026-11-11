import React from 'react';
import { Cpu, Layers, GitBranch, Binary, Activity, Sparkles, CheckCircle2, Download } from 'lucide-react';

interface HeaderProps {
  currentStage: number;
  setCurrentStage: (stage: number) => void;
  selectedCount: number;
  simulatedSuccessProb: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  setCurrentStage,
  selectedCount,
  simulatedSuccessProb,
}) => {
  const stages = [
    { id: 1, label: 'Stage 1: Predict', sub: 'QML vs Classical ML', icon: Activity },
    { id: 2, label: 'Stage 2: Select', sub: 'QUBO / QAOA Optimization', icon: Layers },
    { id: 3, label: 'Stage 3: Simulate', sub: '6-Qubit Quantum Circuit', icon: Cpu },
    { id: 4, label: 'Submission & PRD', sub: 'CSVs & Technical Report', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/15 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hackathon Tag */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-400/20 blur-sm -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 font-mono">
                  DepositIQ
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                  ATOMIQ Hackathon
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Hybrid Quantum-Classical Term Deposit Campaign Pipeline
              </p>
            </div>
          </div>

          {/* Quick Realtime KPIs */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-mono">
            <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Target Selection:</span>
              <span className={`font-bold ${selectedCount === 6 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {selectedCount}/6 Customers
              </span>
              {selectedCount === 6 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>

            <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">P(K ≥ 3):</span>
              <span className="font-bold text-cyan-400">
                {(simulatedSuccessProb * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-300">branch: ayush</span>
            </div>
          </div>
        </div>

        {/* Stage Navigation Stepper Tabs */}
        <div className="flex overflow-x-auto space-x-2 pb-2.5 pt-1 scrollbar-none">
          {stages.map((stg) => {
            const Icon = stg.icon;
            const isActive = currentStage === stg.id;
            return (
              <button
                key={stg.id}
                onClick={() => setCurrentStage(stg.id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-left transition-all duration-200 whitespace-nowrap text-xs font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-200 border border-cyan-400/50 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/80'
                }`}
              >
                <div
                  className={`p-1.5 rounded-md ${
                    isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 flex items-center gap-1">
                    {stg.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {stg.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
