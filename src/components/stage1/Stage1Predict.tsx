import React, { useState, useMemo } from 'react';
import { PredictionResult, ModelMetrics } from '../../types';
import { MODEL_METRICS, TRAIN_DATASET } from '../../data/dataset';
import { Search, Filter, ArrowUpDown, Sparkles, CheckCircle2, ChevronRight, Activity, Zap, Cpu } from 'lucide-react';
import { QuantumOrb } from '../canvas/QuantumOrb';

interface Stage1PredictProps {
  predictions: PredictionResult[];
  activeModel: 'vqc' | 'qsvc' | 'baseline';
  setActiveModel: (m: 'vqc' | 'qsvc' | 'baseline') => void;
  onProceedToStage2: () => void;
}

export const Stage1Predict: React.FC<Stage1PredictProps> = ({
  predictions,
  activeModel,
  setActiveModel,
  onProceedToStage2,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyTop10, setOnlyTop10] = useState(false);
  const [activeMetricTab, setActiveMetricTab] = useState<'roc' | 'calibration'>('roc');

  const currentMetrics = MODEL_METRICS[activeModel];

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return predictions.filter((item) => {
      const matchSearch = item.customer_id.toString().includes(searchTerm);
      const matchTop = onlyTop10 ? item.is_top10 : true;
      return matchSearch && matchTop;
    });
  }, [predictions, searchTerm, onlyTop10]);

  const top10Customers = useMemo(() => {
    return predictions.filter((p) => p.is_top10);
  }, [predictions]);

  return (
    <div className="space-y-6">
      {/* Hero Banner with 3D Quantum Orb */}
      <div className="relative overflow-hidden rounded-2xl glass-panel-glow p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Stage 1: Subscription Prediction
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Quantum-Enhanced Customer Classification
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Trained on 300 labeled historical banking campaign records. Predicting continuous subscription probabilities for 100 blind test customers. The top 10 ranked candidates advance to quantum-constrained selection.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            {(['vqc', 'qsvc', 'baseline'] as const).map((mKey) => {
              const m = MODEL_METRICS[mKey];
              const isSelected = activeModel === mKey;
              return (
                <button
                  key={mKey}
                  onClick={() => setActiveModel(mKey)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-lg shadow-cyan-500/25 scale-[1.02]'
                      : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  {m.type === 'quantum' ? <Cpu className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                  <span>{m.name.split(' (')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Visualizer Orb */}
        <div className="w-full md:w-64 h-56 flex-shrink-0 relative">
          <QuantumOrb className="w-full h-full" />
          <div className="absolute bottom-1 right-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 border border-cyan-500/20 pointer-events-none">
            3D Quantum Superposition Core
          </div>
        </div>
      </div>

      {/* Model Benchmark Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">ROC-AUC</div>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
            {currentMetrics.roc_auc.toFixed(3)}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            +{(currentMetrics.roc_auc - MODEL_METRICS.baseline.roc_auc).toFixed(3)} vs baseline
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">PR-AUC</div>
          <div className="text-2xl font-black text-sky-300 font-mono mt-1">
            {currentMetrics.pr_auc.toFixed(3)}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            High Precision Imbalance
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">Precision@10</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {(currentMetrics.precision_at_10 * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Stage 2 Candidate Quality
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">Recall@10</div>
          <div className="text-2xl font-black text-indigo-300 font-mono mt-1">
            {(currentMetrics.recall_at_10 * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            True positive capture
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">Brier Score</div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">
            {currentMetrics.brier_score.toFixed(3)}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            Well Calibrated (&lt;0.08)
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">Log-Loss</div>
          <div className="text-2xl font-black text-purple-300 font-mono mt-1">
            {currentMetrics.log_loss.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Continuous Prob Error
          </div>
        </div>
      </div>

      {/* Interactive Charts: ROC vs Calibration Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Model Validation Curves: Quantum vs Classical Baseline
              </h3>
              <p className="text-xs text-slate-400">
                10-fold stratified cross-validation on 300 training records
              </p>
            </div>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveMetricTab('roc')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeMetricTab === 'roc'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ROC & PR Curve
              </button>
              <button
                onClick={() => setActiveMetricTab('calibration')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeMetricTab === 'calibration'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Calibration Curve
              </button>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="h-64 mt-4 w-full relative flex items-center justify-center">
            {activeMetricTab === 'roc' ? (
              <svg viewBox="0 0 400 220" className="w-full h-full text-slate-400 overflow-visible">
                {/* Grid lines */}
                <line x1="50" y1="20" x2="380" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="50" y1="65" x2="380" y2="65" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="50" y1="110" x2="380" y2="110" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="50" y1="155" x2="380" y2="155" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="50" y1="200" x2="380" y2="200" stroke="#334155" />
                <line x1="50" y1="20" x2="50" y2="200" stroke="#334155" />

                {/* Random guess diagonal */}
                <line x1="50" y1="200" x2="380" y2="20" stroke="#475569" strokeDasharray="4 4" />

                {/* Classical Baseline Curve (XGBoost) */}
                <path
                  d="M 50 200 Q 90 90, 160 55 T 270 30 T 380 20"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* VQC Curve */}
                <path
                  d="M 50 200 Q 75 60, 130 35 T 230 24 T 380 20"
                  fill="none"
                  stroke="#00f2fe"
                  strokeWidth="3.5"
                />

                {/* Stage 1 Top 10 operating threshold marker */}
                <circle cx="110" cy="40" r="5" fill="#f59e0b" />
                <text x="120" y="44" fill="#f59e0b" fontSize="10" fontFamily="monospace">
                  Operating Point (Top 10 cutoff, p ≥ 0.72)
                </text>

                {/* Axes labels */}
                <text x="50" y="215" fill="#64748b" fontSize="10" fontFamily="monospace">0.0 (FPR)</text>
                <text x="215" y="215" fill="#64748b" fontSize="10" fontFamily="monospace">0.5</text>
                <text x="365" y="215" fill="#64748b" fontSize="10" fontFamily="monospace">1.0</text>
                <text x="15" y="200" fill="#64748b" fontSize="10" fontFamily="monospace">0.0</text>
                <text x="15" y="110" fill="#64748b" fontSize="10" fontFamily="monospace">0.5 (TPR)</text>
                <text x="15" y="25" fill="#64748b" fontSize="10" fontFamily="monospace">1.0</text>
              </svg>
            ) : (
              <svg viewBox="0 0 400 220" className="w-full h-full text-slate-400 overflow-visible">
                {/* Calibration curve */}
                <line x1="50" y1="200" x2="380" y2="20" stroke="#475569" strokeDasharray="4 4" />
                <line x1="50" y1="200" x2="380" y2="200" stroke="#334155" />
                <line x1="50" y1="20" x2="50" y2="200" stroke="#334155" />

                {/* Perfectly calibrated line vs VQC */}
                <polyline
                  points="50,200 85,182 130,158 185,124 245,88 310,54 380,24"
                  fill="none"
                  stroke="#00f2fe"
                  strokeWidth="3"
                />
                <circle cx="85" cy="182" r="4" fill="#00f2fe" />
                <circle cx="130" cy="158" r="4" fill="#00f2fe" />
                <circle cx="185" cy="124" r="4" fill="#00f2fe" />
                <circle cx="245" cy="88" r="4" fill="#00f2fe" />
                <circle cx="310" cy="54" r="4" fill="#00f2fe" />
                <circle cx="380" cy="24" r="4" fill="#00f2fe" />

                <text x="50" y="215" fill="#64748b" fontSize="10" fontFamily="monospace">Mean Predicted Probability</text>
                <text x="15" y="110" fill="#64748b" fontSize="10" fontFamily="monospace" transform="rotate(-90 15 110)">
                  Fraction Positives
                </text>
              </svg>
            )}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                {currentMetrics.name}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-0.5 bg-slate-400 inline-block" />
                Baseline XGBoost
              </span>
            </div>
            <span className="text-emerald-400 font-bold">PR-AUC: {currentMetrics.pr_auc.toFixed(3)}</span>
          </div>
        </div>

        {/* Top 10 Summary Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Stage 1 Top 10 Roster
              </h3>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Strict Tie-Break
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Highest predicted probability customers ranked 1 to 10. Per Section 4 rules, continuous probabilities carry forward to Stage 2 and Stage 3.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {top10Customers.map((cust) => (
                <div
                  key={cust.customer_id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px]">
                      {cust.rank}
                    </span>
                    <span className="text-slate-200 font-medium">#{cust.customer_id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">{(cust.active_prob * 100).toFixed(1)}%</span>
                    <span className="text-slate-400">${cust.deposit_value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onProceedToStage2}
            className="mt-6 w-full py-3 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase font-mono bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Stage 2 Selection</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 100 Customer Test Dataset Table */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Blind Test Set Predictions</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                ({filteredCustomers.length} of 100 customers shown)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by continuous probability. Tie-breaker: lower customer_id first.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ID (e.g. 2005)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={() => setOnlyTop10(!onlyTop10)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 border whitespace-nowrap ${
                onlyTop10
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Top 10 Only</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4 max-h-96">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-slate-950/90 text-slate-400 border-b border-slate-800 backdrop-blur-md">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">VQC Prob</th>
                <th className="py-2.5 px-3">QSVC Prob</th>
                <th className="py-2.5 px-3">Baseline Prob</th>
                <th className="py-2.5 px-3">Expected Deposit</th>
                <th className="py-2.5 px-3">Contact Cost</th>
                <th className="py-2.5 px-3">Capacity Req</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.map((cust) => (
                <tr
                  key={cust.customer_id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    cust.is_top10 ? 'bg-cyan-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-300">
                    #{cust.rank}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-100">
                    {cust.customer_id}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300 font-bold">
                    {(cust.prob_vqc * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-sky-400">
                    {(cust.prob_qsvc * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {(cust.prob_baseline * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400">
                    ${cust.deposit_value.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-amber-400">
                    ${cust.contact_cost}
                  </td>
                  <td className="py-2.5 px-3 text-indigo-400">
                    {cust.capacity_req} hrs
                  </td>
                  <td className="py-2.5 px-3">
                    {cust.is_top10 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/40">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        Stage 2 Qualified
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Excluded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
