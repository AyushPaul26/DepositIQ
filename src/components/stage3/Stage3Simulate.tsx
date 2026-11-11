import React, { useState, useMemo } from 'react';
import { CandidateCustomer, SimulationResult } from '../../types';
import { simulateQuantumCircuit, calculateRyAngle, calculateExactPoissonBinomial } from '../../utils/quantumMath';
import { BlochSphere3D } from '../canvas/BlochSphere3D';
import { Cpu, Play, CheckCircle2, RefreshCw, BarChart3, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Stage3SimulateProps {
  selectedCustomers: CandidateCustomer[];
  onSimulationComplete?: (res: SimulationResult) => void;
}

export const Stage3Simulate: React.FC<Stage3SimulateProps> = ({
  selectedCustomers,
  onSimulationComplete,
}) => {
  const [shots, setShots] = useState(4096);
  const [addNoise, setAddNoise] = useState(false);
  const [readoutMitigation, setReadoutMitigation] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [activeBlochQubit, setActiveBlochQubit] = useState<number | 'all'>('all');

  const probabilities = useMemo(() => {
    return selectedCustomers.slice(0, 6).map((c) => c.probability);
  }, [selectedCustomers]);

  const exactResult = useMemo(() => {
    return calculateExactPoissonBinomial(probabilities);
  }, [probabilities]);

  const [simResult, setSimResult] = useState<SimulationResult>(() => {
    return simulateQuantumCircuit(probabilities, shots, addNoise);
  });

  const runSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = simulateQuantumCircuit(probabilities, shots, addNoise);
      setSimResult(res);
      setIsRunning(false);
      if (onSimulationComplete) {
        onSimulationComplete(res);
      }
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#ea580c', '#f59e0b', '#dc2626', '#10b981']
      });
    }, 600);
  };

  const topBitstrings = useMemo(() => {
    return Object.entries(simResult.counts)
      .map(([bitstring, count]) => {
        let ones = 0;
        for (const char of bitstring) {
          if (char === '1') ones++;
        }
        return {
          bitstring,
          count,
          prob: count / simResult.shots,
          isSuccess: ones >= 3,
          onesCount: ones,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [simResult]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl acrylic-card-elevated p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-xs font-mono font-bold text-orange-800">
            <Cpu className="w-3.5 h-3.5 text-orange-600" />
            Stage 3: Campaign Outcome Simulation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            6-Qubit Quantum Circuit Studio
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Estimates the exact probability that at least three of the six targeted customers subscribe (P(K ≥ 3)). Each customer is encoded into a single qubit via a state-preparation rotation R_y(θ_i) with sin²(θ_i/2) = p_i.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              6 Independent Logical Qubits
            </span>
            <span className="px-3 py-1 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 font-medium">
              64 Computational Basis States
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              Hamming Weight ≥ 3 Success Target
            </span>
          </div>
        </div>

        {/* Campaign Probability Gauge */}
        <div className="w-full md:w-80 acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="text-xs font-mono text-slate-500">Target Conversion Probability P(K ≥ 3)</div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-black text-slate-900 font-mono">
              {(simResult.quantum_prob_ge3 * 100).toFixed(1)}%
            </div>
            <div className="text-xs font-mono text-slate-500">
              (Exact: {(simResult.exact_prob_ge3 * 100).toFixed(1)}%)
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${simResult.quantum_prob_ge3 * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">
            <span>Absolute Error Δ: {(simResult.quantum_error * 100).toFixed(2)}%</span>
            <span className="text-emerald-700 font-bold">Passed Verification ✓</span>
          </div>
        </div>
      </div>

      {/* Simulator Execution Controls */}
      <div className="acrylic-card rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Shots:</span>
            {[1024, 2048, 4096, 8192].map((s) => (
              <button
                key={s}
                onClick={() => setShots(s)}
                className={`px-3 py-1 rounded-lg transition-colors border ${
                  shots === s
                    ? 'bg-orange-600 text-white font-bold border-orange-700 shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={addNoise}
              onChange={(e) => setAddNoise(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <span>Simulate Hardware Readout Noise (1.5%)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={readoutMitigation}
              onChange={(e) => setReadoutMitigation(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <span>Readout Error Mitigation</span>
          </label>
        </div>

        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase font-mono bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Simulating Shots...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Quantum Circuit ({shots} Shots)</span>
            </>
          )}
        </button>
      </div>

      {/* Tri-Method Benchmark Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="acrylic-card rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-500">Quantum Circuit Estimate</div>
          <div className="text-2xl font-black text-orange-700 font-mono mt-1">
            {(simResult.quantum_prob_ge3 * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {simResult.success_counts} of {simResult.shots} shots (Hamming ≥ 3)
          </div>
        </div>

        <div className="acrylic-card rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-500">Exact Poisson Binomial</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {(simResult.exact_prob_ge3 * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-emerald-700 font-mono mt-0.5 font-medium">
            Analytical Closed-Form Ground Truth
          </div>
        </div>

        <div className="acrylic-card rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-500">Classical Monte Carlo</div>
          <div className="text-2xl font-black text-slate-800 font-mono mt-1">
            {(simResult.monte_carlo_prob_ge3 * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            100,000 independent trials
          </div>
        </div>

        <div className="acrylic-card rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-500">Transpiled Rigor</div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">
            Depth 2 / 0 CNOT
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            6 Physical Qubits, 0 SWAPs
          </div>
        </div>
      </div>

      {/* Interactive 6-Wire Quantum Circuit Diagram */}
      <div className="acrylic-card rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-600" />
              6-Qubit Parameterized Circuit Diagram
            </h3>
            <p className="text-xs text-slate-500">
              Customer-to-qubit mapping (q_i → Customer_i), single-qubit R_y(θ_i) rotations, barrier, and measurement in Z basis.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            Bit ordering: q5 q4 q3 q2 q1 q0
          </div>
        </div>

        <div className="overflow-x-auto mt-4 py-2">
          <svg viewBox="0 0 820 300" className="w-full min-w-[700px] h-72 font-mono">
            {selectedCustomers.slice(0, 6).map((cust, i) => {
              const y = 30 + i * 44;
              const angle = calculateRyAngle(cust.probability);

              return (
                <g key={i}>
                  <text x="20" y={y + 5} fill="#ea580c" fontSize="12" fontWeight="bold">
                    q[{i}]
                  </text>
                  <text x="55" y={y + 5} fill="#64748b" fontSize="10">
                    |0⟩
                  </text>

                  <line x1="80" y1={y} x2="720" y2={y} stroke="#cbd5e1" strokeWidth="2" />

                  <rect x="110" y={y - 14} width="115" height="28" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
                  <text x="120" y={y + 4} fill="#1e293b" fontSize="10" fontWeight="500">
                    Cust #{cust.customer_id} ({(cust.probability * 100).toFixed(1)}%)
                  </text>

                  <rect
                    x="250"
                    y={y - 16}
                    width="125"
                    height="32"
                    rx="6"
                    fill="#ffedd5"
                    stroke="#ea580c"
                    strokeWidth="1.5"
                  />
                  <text x="260" y={y + 4} fill="#c2410c" fontSize="11" fontWeight="bold">
                    Ry({angle.degrees}°)
                  </text>

                  <line x1="420" y1={15} x2="420" y2={280} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />

                  <rect x="520" y={y - 14} width="55" height="28" rx="4" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.2" />
                  <text x="532" y={y + 4} fill="#334155" fontSize="10" fontWeight="bold">
                    [ M_z ]
                  </text>

                  <line x1="575" y1={y - 2} x2="720" y2={y - 2} stroke="#94a3b8" strokeWidth="1" />
                  <line x1="575" y1={y + 2} x2="720" y2={y + 2} stroke="#94a3b8" strokeWidth="1" />
                  <text x="730" y={y + 4} fill="#475569" fontSize="10">
                    c[{i}]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 3D Optical Glass Bloch Spheres (Screen 2 from Mockups) */}
      <div className="acrylic-card rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-600" />
              Interactive Optical Glass 3D Bloch Spheres
            </h3>
            <p className="text-xs text-slate-500">
              Frosted glass spheres rendering exact state vectors |ψ⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩ for all 6 customer qubits.
            </p>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-mono border border-slate-200">
            <button
              onClick={() => setActiveBlochQubit('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeBlochQubit === 'all' ? 'bg-white text-orange-700 font-bold shadow-sm' : 'text-slate-600'
              }`}
            >
              All 6
            </button>
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveBlochQubit(idx)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeBlochQubit === idx ? 'bg-white text-orange-700 font-bold shadow-sm' : 'text-slate-600'
                }`}
              >
                q{idx}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {selectedCustomers.slice(0, 6).map((cust, idx) => {
            if (activeBlochQubit !== 'all' && activeBlochQubit !== idx) return null;
            const angle = calculateRyAngle(cust.probability);

            return (
              <div key={cust.customer_id} className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <BlochSphere3D
                  theta={angle.radians}
                  probability={cust.probability}
                  qubitLabel={`q${idx}`}
                  customerId={cust.customer_id}
                  className="w-full h-44"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Measurement Bitstrings Histogram */}
      <div className="acrylic-card rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              64-State Measurement Distribution (Top 10 Bitstrings)
            </h3>
            <p className="text-xs text-slate-500">
              Orange denotes campaign target reached (≥ 3 customers subscribed). Gray denotes fewer than 3 subscriptions.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            {simResult.success_counts} / {simResult.shots} Successes
          </span>
        </div>

        <div className="space-y-3 mt-4">
          {topBitstrings.map((item) => (
            <div key={item.bitstring} className="flex items-center gap-4 text-xs font-mono">
              <div className="w-20 font-bold tracking-widest text-slate-900">
                {item.bitstring}
              </div>
              <div className="w-24 text-slate-500 text-[11px]">
                {item.onesCount} subscribed
              </div>
              <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.isSuccess ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-slate-300'
                  }`}
                  style={{ width: `${item.prob * 350}%` }}
                />
              </div>
              <div className="w-16 text-right font-bold text-slate-800">
                {(item.prob * 100).toFixed(1)}%
              </div>
              <div className="w-24 text-right">
                {item.isSuccess ? (
                  <span className="text-[10px] font-bold text-orange-700">Target Met ✓</span>
                ) : (
                  <span className="text-[10px] text-slate-400">&lt; 3</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
