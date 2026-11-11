import React from 'react';
import { Cpu, Layers, GitBranch, Activity, Sparkles, CheckCircle2, Download } from 'lucide-react';

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
    { id: 2, label: 'Stage 2: Select', sub: 'QUBO / QAOA 3D Arena', icon: Layers },
    { id: 3, label: 'Stage 3: Simulate', sub: '6-Qubit Quantum Studio', icon: Cpu },
    { id: 4, label: 'Submission & PRD', sub: 'CSVs & Technical Report', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Challenge Badge */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-base shadow-md shadow-orange-500/20 font-mono">
              ψ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900 font-mono">
                  DepositIQ
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md bg-orange-100 text-orange-800 border border-orange-200">
                  ATOMIQ Hackathon
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Hybrid Quantum-Classical Term Deposit Pipeline
              </p>
            </div>
          </div>

          {/* Realtime KPI Badges */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500">Target Selection:</span>
              <span className={`font-bold ${selectedCount === 6 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {selectedCount}/6 Customers
              </span>
              {selectedCount === 6 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500">P(K ≥ 3):</span>
              <span className="font-bold text-orange-700">
                {(simulatedSuccessProb * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
              <GitBranch className="w-3.5 h-3.5 text-orange-600" />
              <span>branch: <strong className="text-slate-900">ayush</strong></span>
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
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-left transition-all duration-200 whitespace-nowrap text-xs ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-md shadow-orange-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-sm'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className={`font-semibold ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    {stg.label}
                  </div>
                  <div className={`text-[10px] font-normal ${isActive ? 'text-orange-100' : 'text-slate-500'}`}>
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
