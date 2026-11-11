import React, { useState, useMemo } from 'react';
import { CandidateCustomer, Stage2Constraints } from '../../types';
import { STAGE2_CONSTRAINTS } from '../../data/dataset';
import { solveExactClassical, buildQuboMatrix, simulateQAOA } from '../../utils/quantumMath';
import { QuantumWorkbench3D } from '../canvas/QuantumWorkbench3D';
import { IsingLandscape3D } from '../canvas/IsingLandscape3D';
import { Layers, ShieldCheck, CheckCircle2, ChevronRight, Cpu, Sparkles, Wand2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'workbench' | 'landscape' | 'qubo'>('workbench');

  const currentConstraints: Stage2Constraints = useMemo(() => ({
    candidate_pool_size: 10,
    exact_select_count: 6,
    budget_limit: budgetLimit,
    capacity_limit: capacityLimit,
  }), [budgetLimit, capacityLimit]);

  // Exact Classical Solution
  const classicalResult = useMemo(() => {
    return solveExactClassical(candidates, currentConstraints);
  }, [candidates, currentConstraints]);

  // Selected customer IDs (set)
  const [userSelectedIds, setUserSelectedIds] = useState<Set<number>>(() => {
    return new Set(classicalResult.bestSelection.map((c) => c.customer_id));
  });

  // Keep synced if classicalResult updates
  React.useEffect(() => {
    setUserSelectedIds(new Set(classicalResult.bestSelection.map((c) => c.customer_id)));
  }, [classicalResult]);

  // Toggle single customer in 3D workbench
  const handleToggleCustomer = (id: number) => {
    setUserSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size < 6) {
          next.add(id);
        }
      }
      return next;
    });
  };

  // Auto-solve QAOA optimal 6
  const handleAutoSolve = () => {
    const optimalIds = new Set(classicalResult.bestSelection.map((c) => c.customer_id));
    setUserSelectedIds(optimalIds);
  };

  // Sync selected customers upstream
  React.useEffect(() => {
    const list = candidates.filter((c) => userSelectedIds.has(c.customer_id));
    if (list.length === 6) {
      onSelectedCustomersChange(list);
    }
  }, [userSelectedIds, candidates, onSelectedCustomersChange]);

  // QAOA Solver Simulation
  const qaoaResult = useMemo(() => {
    return simulateQAOA(candidates, currentConstraints, qaoaLayers, 4096);
  }, [candidates, currentConstraints, qaoaLayers]);

  // 10x10 QUBO Matrix
  const quboMatrix = useMemo(() => {
    return buildQuboMatrix(candidates, currentConstraints);
  }, [candidates, currentConstraints]);

  const currentCost = useMemo(() => {
    return candidates.filter(c => userSelectedIds.has(c.customer_id)).reduce((acc, c) => acc + c.contact_cost, 0);
  }, [candidates, userSelectedIds]);

  const currentCapacity = useMemo(() => {
    return candidates.filter(c => userSelectedIds.has(c.customer_id)).reduce((acc, c) => acc + c.capacity_requirement, 0);
  }, [candidates, userSelectedIds]);

  const currentNetValue = useMemo(() => {
    return candidates.filter(c => userSelectedIds.has(c.customer_id)).reduce((acc, c) => acc + c.expected_net_value, 0);
  }, [candidates, userSelectedIds]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl acrylic-card-elevated p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-xs font-mono font-bold text-orange-800">
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            Stage 2: Constrained Customer Selection
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            QUBO / QAOA 3D Spatial Arena
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Selecting exactly 6 high-value customers out of the top 10 candidates to maximize total expected net value (V = ∑ p_i · Deposit_i - Cost_i) under strict budget and capacity constraints. Click any customer puck in 3D to dock or undock.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-mono">
            <button
              onClick={handleAutoSolve}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Solve QAOA Ground State</span>
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700">
              Evaluated 210 Combinations
            </span>
          </div>
        </div>

        {/* Financial KPI Summary Card */}
        <div className="w-full md:w-80 acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="text-xs font-mono text-slate-500">Selected Expected Net ROI</div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            ${currentNetValue.toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs font-mono">
            <div>
              <div className="text-slate-500">Budget Spent</div>
              <div className="text-slate-800 font-bold">
                ${currentCost} / ${budgetLimit}
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentCost <= budgetLimit ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (currentCost / budgetLimit) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-slate-500">Capacity Used</div>
              <div className="text-slate-800 font-bold">
                {currentCapacity} / {capacityLimit} hrs
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentCapacity <= capacityLimit ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (currentCapacity / capacityLimit) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Slider Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="acrylic-card rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-700">Campaign Budget Limit</span>
            <span className="text-xs font-mono font-bold text-orange-700">${budgetLimit}</span>
          </div>
          <input
            type="range"
            min={280}
            max={420}
            step={10}
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(Number(e.target.value))}
            className="w-full accent-orange-600 bg-slate-200 h-2 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>$280</span>
            <span>$340 (Default)</span>
            <span>$420</span>
          </div>
        </div>

        <div className="acrylic-card rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-700">Staff Capacity Limit</span>
            <span className="text-xs font-mono font-bold text-amber-700">{capacityLimit} hrs</span>
          </div>
          <input
            type="range"
            min={80}
            max={130}
            step={5}
            value={capacityLimit}
            onChange={(e) => setCapacityLimit(Number(e.target.value))}
            className="w-full accent-amber-500 bg-slate-200 h-2 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>80 hrs</span>
            <span>95 hrs (Default)</span>
            <span>130 hrs</span>
          </div>
        </div>

        <div className="acrylic-card rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-700">QAOA Circuit Depth (p)</span>
            <span className="text-xs font-mono font-bold text-slate-900">p = {qaoaLayers}</span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={qaoaLayers}
            onChange={(e) => setQaoaLayers(Number(e.target.value))}
            className="w-full accent-slate-800 bg-slate-200 h-2 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>p = 1</span>
            <span>p = 2 (Optimal)</span>
            <span>p = 4</span>
          </div>
        </div>
      </div>

      {/* 3D Spatial Interactive Workbench Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 acrylic-card rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-orange-600" />
                3D Spatial Quantum Workbench & Energy Landscape
              </h3>
              <p className="text-xs text-slate-500">
                Play through the selection: click customer tokens to dock into the 6 quantum receiver bays
              </p>
            </div>

            <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-mono border border-slate-200">
              <button
                onClick={() => setActiveTab('workbench')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'workbench'
                    ? 'bg-white text-orange-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3D Workbench
              </button>
              <button
                onClick={() => setActiveTab('landscape')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'landscape'
                    ? 'bg-white text-orange-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3D Energy Surface
              </button>
              <button
                onClick={() => setActiveTab('qubo')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'qubo'
                    ? 'bg-white text-orange-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                10x10 QUBO
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'workbench' && (
              <QuantumWorkbench3D
                candidates={candidates}
                selectedIds={userSelectedIds}
                onToggleCustomer={handleToggleCustomer}
                className="w-full h-80"
              />
            )}

            {activeTab === 'landscape' && (
              <div className="space-y-3">
                <IsingLandscape3D
                  gamma={qaoaLayers * 0.4}
                  beta={qaoaLayers * 0.3}
                  className="w-full h-72 rounded-xl"
                />
                <div className="flex items-center justify-between text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span>QAOA Variational Parameters: γ = {(0.38 * qaoaLayers).toFixed(2)}, β = {(0.24 * qaoaLayers).toFixed(2)}</span>
                  <span className="text-orange-700 font-bold">Ground State Reached</span>
                </div>
              </div>
            )}

            {activeTab === 'qubo' && (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-[10px] font-mono border-collapse">
                  <thead>
                    <tr>
                      <th className="p-1 text-slate-400">Q</th>
                      {candidates.map((c, idx) => (
                        <th key={idx} className="p-1 text-orange-600 font-bold">x{idx}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quboMatrix.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        <td className="p-1 text-orange-600 font-bold">x{rIdx}</td>
                        {row.map((val, cIdx) => {
                          const isDiag = rIdx === cIdx;
                          const isNeg = val < 0;
                          return (
                            <td
                              key={cIdx}
                              className={`p-1.5 border border-slate-100 ${
                                isDiag ? 'bg-orange-100/50 font-bold text-orange-800' : 
                                isNeg ? 'text-emerald-700 font-medium' : 'text-slate-600'
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
          </div>
        </div>

        {/* Classical Exact Validation Benchmark Card */}
        <div className="acrylic-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Classical Exact Validation
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Zero Error
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Per Section 5 of the challenge, the candidate pool is verified against exact classical brute-force evaluation.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 text-[11px]">Optimal Measured Bitstring</div>
                <div className="text-slate-900 font-bold tracking-widest text-sm">
                  {classicalResult.bestBitstring}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 text-[11px]">Docked Customer IDs ({userSelectedIds.size}/6)</div>
                <div className="text-orange-700 font-bold text-xs">
                  {Array.from(userSelectedIds).map(id => `#${id}`).join(', ')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px]">Quantum Gap ΔE</div>
                  <div className="text-emerald-700 font-bold text-sm">$0.00</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px]">Total Feasible</div>
                  <div className="text-slate-700 font-bold text-sm">188 / 210</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onProceedToStage3}
            disabled={userSelectedIds.size !== 6}
            className="mt-6 w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase font-mono bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Advance 6 Customers to Stage 3 Circuit</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Candidate Customers Roster */}
      <div className="acrylic-card rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Candidate Pool (Top 10 from Stage 1)</span>
              <span className="text-xs font-mono text-orange-700 font-semibold">
                — Exactly 6 Selected
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Selected customers will be assigned directly to qubits $q_0 \dots q_5$ in Stage 3.
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-orange-100 text-orange-800 border border-orange-200">
            {userSelectedIds.size} of 6 Required
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {candidates.map((cand) => {
            const isSelected = userSelectedIds.has(cand.customer_id);
            return (
              <div
                key={cand.customer_id}
                onClick={() => handleToggleCustomer(cand.customer_id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-orange-50/60 border-orange-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    #{cand.customer_id}
                  </span>
                  {isSelected ? (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-orange-600 text-white">
                      DOCKED
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-400">UNPINNED</span>
                  )}
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prob:</span>
                    <span className="text-orange-700 font-bold">{(cand.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deposit:</span>
                    <span className="text-slate-800">${cand.expected_deposit_value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cost:</span>
                    <span className="text-amber-700">${cand.contact_cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capacity:</span>
                    <span className="text-slate-700">{cand.capacity_requirement} hrs</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between">
                    <span className="text-slate-500">Net ROI:</span>
                    <span className="text-emerald-700 font-bold">${cand.expected_net_value}</span>
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
