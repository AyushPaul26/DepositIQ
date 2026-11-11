import React, { useState, useMemo } from 'react';
import { Header } from './components/common/Header';
import { Stage1Predict } from './components/stage1/Stage1Predict';
import { Stage2Select } from './components/stage2/Stage2Select';
import { Stage3Simulate } from './components/stage3/Stage3Simulate';
import { SubmissionHub } from './components/submission/SubmissionHub';
import { computePredictions, STAGE2_CONSTRAINTS } from './data/dataset';
import { CandidateCustomer, SimulationResult } from './types';
import { solveExactClassical, simulateQuantumCircuit } from './utils/quantumMath';

export function App() {
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [activeModel, setActiveModel] = useState<'vqc' | 'qsvc' | 'baseline'>('vqc');

  // Compute Stage 1 predictions based on chosen model
  const predictions = useMemo(() => {
    return computePredictions(activeModel);
  }, [activeModel]);

  // Stage 2 Candidate Pool: Top 10 from Stage 1
  const stage2Candidates: CandidateCustomer[] = useMemo(() => {
    return predictions.slice(0, 10).map((p) => {
      const netVal = Math.round(p.active_prob * p.deposit_value - p.contact_cost);
      return {
        customer_id: p.customer_id,
        probability: p.active_prob,
        expected_deposit_value: p.deposit_value,
        contact_cost: p.contact_cost,
        capacity_requirement: p.capacity_req,
        expected_net_value: netVal,
        selected_by_quantum: false,
        selected_by_classical: false,
      };
    });
  }, [predictions]);

  // Solve exact classical baseline initially for default 6 selected customers
  const defaultSelection = useMemo(() => {
    const res = solveExactClassical(stage2Candidates, STAGE2_CONSTRAINTS);
    return res.bestSelection;
  }, [stage2Candidates]);

  // Selected 6 customers state
  const [selectedCustomers, setSelectedCustomers] = useState<CandidateCustomer[]>(defaultSelection);

  // Keep selected customers synchronized when candidate pool changes
  React.useEffect(() => {
    setSelectedCustomers(defaultSelection);
  }, [defaultSelection]);

  // Stage 3 Simulation result state
  const [simResult, setSimResult] = useState<SimulationResult>(() => {
    const probs = defaultSelection.slice(0, 6).map((c) => c.probability);
    return simulateQuantumCircuit(probs, 4096, false);
  });

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 quantum-grid-bg flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      <div>
        <Header
          currentStage={currentStage}
          setCurrentStage={setCurrentStage}
          selectedCount={selectedCustomers.length}
          simulatedSuccessProb={simResult.quantum_prob_ge3}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentStage === 1 && (
            <Stage1Predict
              predictions={predictions}
              activeModel={activeModel}
              setActiveModel={setActiveModel}
              onProceedToStage2={() => setCurrentStage(2)}
            />
          )}

          {currentStage === 2 && (
            <Stage2Select
              candidates={stage2Candidates}
              onSelectedCustomersChange={setSelectedCustomers}
              onProceedToStage3={() => setCurrentStage(3)}
            />
          )}

          {currentStage === 3 && (
            <Stage3Simulate
              selectedCustomers={selectedCustomers}
              onSimulationComplete={setSimResult}
            />
          )}

          {currentStage === 4 && (
            <SubmissionHub
              predictions={predictions}
              candidates={stage2Candidates}
              selectedCustomers={selectedCustomers}
              simResult={simResult}
              constraints={STAGE2_CONSTRAINTS}
            />
          )}
        </main>
      </div>

      {/* Cybernetic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/70 py-6 mt-12 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300 font-bold">DepositIQ</span>
            <span>— The ATOMIQ Hackathon Challenge Pipeline</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Branch: <span className="text-indigo-400 font-semibold">ayush</span></span>
            <span>Repository: <span className="text-cyan-400">Mayank2177/DepositIQ</span></span>
            <span>Qiskit / Three.js / WebGL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

