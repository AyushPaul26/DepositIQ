export interface CustomerFeature {
  customer_id: number;
  age: number;
  job: string;
  marital: string;
  education: string;
  default: boolean;
  balance: number;
  housing: boolean;
  loan: boolean;
  contact: string;
  day: number;
  month: string;
  duration: number;
  campaign: number;
  pdays: number;
  previous: number;
  poutcome: string;
  y?: number; // Ground truth if training set
}

export interface PredictionResult {
  customer_id: number;
  prob_vqc: number;
  prob_qsvc: number;
  prob_baseline: number;
  active_prob: number;
  rank: number;
  is_top10: boolean;
  deposit_value: number;
  contact_cost: number;
  capacity_req: number;
}

export interface ModelMetrics {
  name: string;
  type: 'quantum' | 'classical';
  roc_auc: number;
  pr_auc: number;
  precision_at_10: number;
  recall_at_10: number;
  brier_score: number;
  log_loss: number;
  train_time_sec: number;
  parameters: number;
}

export interface CandidateCustomer {
  customer_id: number;
  probability: number;
  expected_deposit_value: number;
  contact_cost: number;
  capacity_requirement: number;
  expected_net_value: number;
  selected_by_quantum: boolean;
  selected_by_classical: boolean;
  qubit_index?: number;
}

export interface Stage2Constraints {
  candidate_pool_size: number; // 10
  exact_select_count: number;  // 6
  budget_limit: number;        // e.g. 500
  capacity_limit: number;      // e.g. 120
}

export interface QaoaParameters {
  layers: number;
  gamma: number[];
  beta: number[];
  shots: number;
  penalty_cardinality: number;
  penalty_budget: number;
  penalty_capacity: number;
}

export interface SimulationResult {
  shots: number;
  quantum_prob_ge3: number;
  exact_prob_ge3: number;
  monte_carlo_prob_ge3: number;
  quantum_error: number;
  monte_carlo_error: number;
  counts: Record<string, number>;
  success_counts: number;
  total_counts: number;
  logical_qubits: number;
  physical_qubits: number;
  circuit_depth: number;
  cnot_count: number;
  single_qubit_count: number;
}
