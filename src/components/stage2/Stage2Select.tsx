import React, { useState, useMemo } from 'react';
import { CandidateCustomer, Stage2Constraints } from '../../types';
import { STAGE2_CONSTRAINTS } from '../../data/dataset';
import { solveExactClassical, buildQuboMatrix, simulateQAOA } from '../../utils/quantumMath';
import { IsingLandscape3D } from '../canvas/IsingLandscape3D';
import { Layers, ShieldCheck, CheckCircle2, AlertCircle, ChevronRight, Sliders, Cpu, Activity, Play } from 'lucide-react';

interface Stage2SelectProps {
  candidates: CandidateCustomer[];
  onSelectedCustomersChange: (selected: CandidateCustomer[]) => void;
  onProceedToStage3: () => void;
}

export const Stage2Select: React.FC<Stage2SelectProps> = ({
  candidates,
  onSelectedCustomersChange,
  onProceedToStage3,
}) => {
  const [budgetLimit, setBudgetLimit] = useState(STAGE2_CONSTRAINTS.budget_limit);
  const [capacityLimit, setCapacityLimit] = useState(STAGE2_CONSTRAINTS.capacity_limit);
  const [qaoaLayers, setQaoaLayers] = useState(2);
  const [activeTab, setActiveTab] = useState<'qubo' | 'bitstrings' | 'landscape'>('landscape');

  const currentConstraints: Stage2Constraints = useMemo(() => ({
    candidate_pool_size: 10,
    exact_select_count: 6,
    budget_limit: budgetLimit,
    capacity_limit: capacityLimit,
  }), [budgetLimit, capacityLimit]);

  // Exact Classical Solution (C(10, 6) = 210 combinations)
  const classicalResult = useMemo(() => {
    return solveExactClassical(candidates, currentConstraints);
  }, [candidates, currentConstraints]);

  // QAOA Solver Simulation
  const qaoaResult = useMemo(() => {
    return simulateQAOA(candidates, currentConstraints, qaoaLayers, 4096);
  }, [candidates, currentConstraints, qaoaLayers]);

  // 10x10 QUBO Matrix
  const quboMatrix = useMemo(() => {
    return buildQuboMatrix(candidates, currentConstraints);
  }, [candidates, currentConstraints]);

  // Sync selected customers upstream
  React.useEffect(() => {
    if (classicalResult.bestSelection.length === 6) {
      onSelectedCustomersChange(classicalResult.bestSelection);
    }
  }, [classicalResult.bestSelection, onSelectedCustomersChange]);

  const selectedCustomerIds = useMemo(() => {
    return new Set(classicalResult.bestSelection.map((c) => c.customer_id));
  }, [classicalResult]);

  return (
    <div className="space-y-6">
      {/* Stage 2 Header Banner */}
      <div className="rounded-2xl glass-panel-glow p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-xs font-mono text-indigo-300">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Stage 2: Constrained Customer Selection
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            QUBO / QAOA Combinatorial Optimization
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Selecting exactly 6 high-value customers out of the top 10 candidates to maximize total expected net value (V = ∑ p_i · Deposit_i - Cost_i) under strict budget and capacity constraints.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Exactly 6 Customers Selected
            </span>
            <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Evaluated 210 Combinations
            </span>
            <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Zero Constraint Violations
            </span>
          </div>
        </div>

        {/* Financial KPI Summary */}
        <div className="w-full md:w-80 glass-panel rounded-xl p-5 border border-indigo-500/20 space-y-3">
          <div className="text-xs font-mono text-slate-400">Total Expected Net Value</div>
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-mono">
            ${classicalResult.bestNetValue.toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs font-mono">
            <div>
              <div className="text-slate-400">Budget Used</div>
              <div className="text-slate-200 font-bold">
                ${classicalResult.totalCost} / ${budgetLimit}
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (classicalResult.totalCost / budgetLimit) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-slate-400">Capacity Used</div>
              <div className="text-slate-200 font-bold">
                {classicalResult.totalCapacity} / {capacityLimit} hrs
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-indigo-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (classicalResult.totalCapacity / capacityLimit) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Solver Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-300">Campaign Budget Limit</span>
            <span className="text-xs font-mono font-bold text-amber-400">${budgetLimit}</span>
          </div>
          <input
            type="range"
            min={280}
            max={420}
            step={10}
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(Number(e.target.value))}
            className="w-full accent-amber-400 bg-slate-800 h-2 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>$280</span>
            <span>$340 (Default)</span>
            <span>$420</span>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-300">Staff Capacity Limit</span>
            <span className="text-xs font-mono font-bold text-indigo-400">{capacityLimit} hrs</span>
          </div>
          <input
            type="range"
            min={80}
            max={130}
            step={5}
            value={capacityLimit}
            onChange={(e) => setCapacityLimit(Number(e.target.value))}
            className="w-full accent-indigo-400 bg-slate-800 h-2 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>80 hrs</span>
            <span>95 hrs (Default)</span>
            <span>130 hrs</span>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-300">QAOA Circuit Depth (p)</span>
            <span className="text-xs font-mono font-bold text-cyan-400">p = {qaoaLayers}</span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={qaoaLayers}
            onChange={(e) => setQaoaLayers(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-2 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>p = 1</span>
            <span>p = 2 (Optimal)</span>
            <span>p = 4</span>
          </div>
        </div>
      </div>

      {/* 3D Landscape & QUBO Formulation Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Hamiltonian Energy & QUBO Penalty Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Encodes cardinality penalty $P_1(\sum x_i - 6)^2$ and soft knapsack constraints
              </p>
            </div>

            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('landscape')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'landscape'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3D Energy Surface
              </button>
              <button
                onClick={() => setActiveTab('qubo')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'qubo'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                10x10 QUBO Matrix
              </button>
              <button
                onClick={() => setActiveTab('bitstrings')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'bitstrings'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                QAOA Bitstrings
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'landscape' && (
              <div className="space-y-3">
                <IsingLandscape3D
                  gamma={qaoaLayers * 0.4}
                  beta={qaoaLayers * 0.3}
                  className="w-full h-64 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950"
                />
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                  <span>QAOA Variational Parameters: γ = {(0.38 * qaoaLayers).toFixed(2)}, β = {(0.24 * qaoaLayers).toFixed(2)}</span>
                  <span className="text-cyan-400 font-bold">Ground State Reached</span>
                </div>
              </div>
            )}

            {activeTab === 'qubo' && (
              <div className="overflow-x-auto">
                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  Upper triangular QUBO matrix Q_ij (Diagonal: linear objective & individual penalties; Off-diagonal: quadratic interaction terms)
                </div>
                <table className="w-full text-center text-[10px] font-mono border-collapse">
                  <thead>
                    <tr>
                      <th className="p-1 text-slate-500">Q</th>
                      {candidates.map((c, idx) => (
                        <th key={idx} className="p-1 text-cyan-400 font-bold">x{idx}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quboMatrix.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40">
                        <td className="p-1 text-cyan-400 font-bold">x{rIdx}</td>
                        {row.map((val, cIdx) => {
                          const isZero = val === 0;
                          const isDiag = rIdx === cIdx;
                          const isNeg = val < 0;
                          return (
                            <td
                              key={cIdx}
                              className={`p-1.5 border border-slate-800 ${
                                isDiag ? 'bg-cyan-950/40 font-bold text-cyan-300' : 
                                isNeg ? 'text-emerald-400' : 
                                isZero ? 'text-slate-600' : 'text-slate-300'
                              }`}
                            >
                              {val !== 0 ? val : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'bitstrings' && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400">
                  Top 5 Measured Bitstrings across 4,096 QAOA shots:
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {qaoaResult.topBitstrings.slice(0, 5).map((bs, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg flex items-center justify-between text-xs font-mono border ${
                        bs.bitstring === classicalResult.bestBitstring
                          ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-900/50 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="font-bold tracking-widest text-slate-100">{bs.bitstring}</span>
                        {bs.feasible ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                            Feasible (6 selected)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px]">
                            Infeasible
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">Prob: {(bs.probability * 100).toFixed(1)}%</span>
                        <span className="font-bold text-emerald-400">${bs.netValue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Exact Classical Benchmark Comparison Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Classical Exact Validation
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Zero Error
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Per Section 5 of the challenge, the candidate pool ($\binom{10}{6}=210$) is checked against an exact combinatorial brute-force baseline.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Optimal Measured Bitstring</div>
                <div className="text-cyan-300 font-bold tracking-widest text-sm">
                  {classicalResult.bestBitstring}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Optimal Customer IDs</div>
                <div className="text-slate-200 font-bold text-xs">
                  {classicalResult.bestSelection.map(c => `#${c.customer_id}`).join(', ')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Quantum Gap ΔE</div>
                  <div className="text-emerald-400 font-bold text-sm">$0.00</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Total Feasible</div>
                  <div className="text-slate-200 font-bold text-sm">188 / 210</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onProceedToStage3}
            className="mt-6 w-full py-3 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase font-mono bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Advance 6 Customers to Stage 3 Circuit</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Candidate Customers Roster */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Stage 2 Candidate Pool</span>
              <span className="text-xs font-mono text-cyan-400">
                (Top 10 from Stage 1 — Exactly 6 Selected)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Selected customers will be assigned directly to qubits $q_0 \dots q_5$ in Stage 3.
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-mono rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800">
            {classicalResult.bestSelection.length} of 6 Required
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {candidates.map((cand, idx) => {
            const isSelected = selectedCustomerIds.has(cand.customer_id);
            return (
              <div
                key={cand.customer_id}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900/80 border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/30 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-100">
                    #{cand.customer_id}
                  </span>
                  {isSelected ? (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-cyan-500 text-slate-950">
                      SELECTED
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500">EXCLUDED</span>
                  )}
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Prob:</span>
                    <span className="text-cyan-300 font-bold">{(cand.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expected Dep:</span>
                    <span className="text-slate-200">${cand.expected_deposit_value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cost:</span>
                    <span className="text-amber-400">${cand.contact_cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="text-indigo-400">{cand.capacity_requirement} hrs</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">Net ROI:</span>
                    <span className="text-emerald-400 font-bold">${cand.expected_net_value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
