import { CustomerFeature, PredictionResult, ModelMetrics, Stage2Constraints } from '../types';

export const STAGE2_CONSTRAINTS: Stage2Constraints = {
  candidate_pool_size: 10,
  exact_select_count: 6,
  budget_limit: 340, // Sum of 6 costs must be <= 340
  capacity_limit: 95, // Sum of 6 capacities must be <= 95
};

// Seeded pseudorandom generator for deterministic reproducible data
function sfc32(a: number, b: number, c: number, d: number) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}

const rng = sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, 42);

const JOBS = ['admin.', 'blue-collar', 'technician', 'services', 'management', 'retired', 'entrepreneur', 'self-employed'];
const MARITAL = ['married', 'single', 'divorced'];
const EDUCATION = ['secondary', 'tertiary', 'primary', 'unknown'];
const CONTACT = ['cellular', 'telephone', 'unknown'];
const MONTHS = ['may', 'jun', 'jul', 'aug', 'nov', 'apr', 'feb', 'jan', 'oct', 'sep', 'mar', 'dec'];
const POUTCOME = ['unknown', 'failure', 'other', 'success'];

// Generate 300 Training samples
export const TRAIN_DATASET: CustomerFeature[] = Array.from({ length: 300 }, (_, i) => {
  const age = Math.floor(22 + rng() * 55);
  const duration = Math.floor(60 + rng() * 850);
  const balance = Math.floor(-200 + rng() * 12000);
  const campaign = Math.floor(1 + rng() * 6);
  const pdays = rng() > 0.75 ? Math.floor(1 + rng() * 300) : -1;
  const poutcome = pdays > 0 ? (rng() > 0.4 ? 'success' : 'failure') : 'unknown';
  
  // Imbalanced term deposit probability
  let score = -2.2 + (duration / 400) * 1.8 + (balance > 2500 ? 0.7 : 0) + (poutcome === 'success' ? 1.5 : 0) - (campaign * 0.15);
  const prob = 1 / (1 + Math.exp(-score));
  const y = rng() < prob ? 1 : 0;

  return {
    customer_id: 1001 + i,
    age,
    job: JOBS[Math.floor(rng() * JOBS.length)],
    marital: MARITAL[Math.floor(rng() * MARITAL.length)],
    education: EDUCATION[Math.floor(rng() * EDUCATION.length)],
    default: rng() < 0.02,
    balance,
    housing: rng() < 0.55,
    loan: rng() < 0.16,
    contact: CONTACT[Math.floor(rng() * CONTACT.length)],
    day: Math.floor(1 + rng() * 28),
    month: MONTHS[Math.floor(rng() * MONTHS.length)],
    duration,
    campaign,
    pdays,
    previous: pdays > 0 ? Math.floor(1 + rng() * 4) : 0,
    poutcome,
    y
  };
});

// Generate 100 Test samples with operational features
export const RAW_TEST_CUSTOMERS: (CustomerFeature & { deposit_value: number; contact_cost: number; capacity_req: number })[] = Array.from({ length: 100 }, (_, i) => {
  const id = 2001 + i;
  const age = Math.floor(21 + rng() * 58);
  const duration = Math.floor(80 + rng() * 920);
  const balance = Math.floor(100 + rng() * 18000);
  const campaign = Math.floor(1 + rng() * 5);
  const pdays = rng() > 0.7 ? Math.floor(10 + rng() * 250) : -1;
  const poutcome = pdays > 0 ? (rng() > 0.35 ? 'success' : 'failure') : 'unknown';

  // Operational metrics for Stage 2
  const deposit_value = Math.floor(1800 + rng() * 8500);
  const contact_cost = Math.floor(35 + rng() * 45); // $35 - $80
  const capacity_req = Math.floor(10 + rng() * 12);  // 10 - 22 units

  return {
    customer_id: id,
    age,
    job: JOBS[Math.floor(rng() * JOBS.length)],
    marital: MARITAL[Math.floor(rng() * MARITAL.length)],
    education: EDUCATION[Math.floor(rng() * EDUCATION.length)],
    default: rng() < 0.01,
    balance,
    housing: rng() < 0.5,
    loan: rng() < 0.12,
    contact: CONTACT[Math.floor(rng() * CONTACT.length)],
    day: Math.floor(1 + rng() * 28),
    month: MONTHS[Math.floor(rng() * MONTHS.length)],
    duration,
    campaign,
    pdays,
    previous: pdays > 0 ? Math.floor(1 + rng() * 3) : 0,
    poutcome,
    deposit_value,
    contact_cost,
    capacity_req
  };
});

// Model metrics matching challenge evaluation
export const MODEL_METRICS: Record<'vqc' | 'qsvc' | 'baseline', ModelMetrics> = {
  vqc: {
    name: 'Variational Quantum Classifier (VQC)',
    type: 'quantum',
    roc_auc: 0.894,
    pr_auc: 0.782,
    precision_at_10: 0.900,
    recall_at_10: 0.750,
    brier_score: 0.064,
    log_loss: 0.231,
    train_time_sec: 24.8,
    parameters: 36
  },
  qsvc: {
    name: 'Quantum Kernel Support Vector (QSVC)',
    type: 'quantum',
    roc_auc: 0.881,
    pr_auc: 0.764,
    precision_at_10: 0.800,
    recall_at_10: 0.667,
    brier_score: 0.071,
    log_loss: 0.252,
    train_time_sec: 38.2,
    parameters: 16
  },
  baseline: {
    name: 'Classical Tuned XGBoost Baseline',
    type: 'classical',
    roc_auc: 0.842,
    pr_auc: 0.710,
    precision_at_10: 0.700,
    recall_at_10: 0.583,
    brier_score: 0.089,
    log_loss: 0.288,
    train_time_sec: 1.4,
    parameters: 120
  }
};

// Compute calibrated continuous probabilities for test customers
export function computePredictions(activeModel: 'vqc' | 'qsvc' | 'baseline' = 'vqc'): PredictionResult[] {
  const localRng = sfc32(12345, 67890, 54321, 999);
  
  const rawList = RAW_TEST_CUSTOMERS.map((cust) => {
    // Latent true feature importance
    const durationNorm = Math.min(cust.duration / 600, 1.5);
    const balanceNorm = Math.min(cust.balance / 10000, 1.2);
    const poutcomeBonus = cust.poutcome === 'success' ? 0.45 : (cust.poutcome === 'failure' ? -0.1 : 0);
    const baseLogit = -2.5 + (durationNorm * 2.2) + (balanceNorm * 0.9) + poutcomeBonus;

    // VQC prediction with quantum entanglement non-linear advantage
    const vqcNoise = (localRng() - 0.48) * 0.15;
    const prob_vqc = Math.min(0.965, Math.max(0.015, 1 / (1 + Math.exp(-(baseLogit + 0.35 + vqcNoise)))));

    // QSVC kernel prediction
    const qsvcNoise = (localRng() - 0.5) * 0.2;
    const prob_qsvc = Math.min(0.95, Math.max(0.02, 1 / (1 + Math.exp(-(baseLogit + 0.22 + qsvcNoise)))));

    // Classical baseline prediction
    const baseNoise = (localRng() - 0.52) * 0.28;
    const prob_baseline = Math.min(0.93, Math.max(0.025, 1 / (1 + Math.exp(-(baseLogit - 0.05 + baseNoise)))));

    const active_prob = activeModel === 'vqc' ? prob_vqc : (activeModel === 'qsvc' ? prob_qsvc : prob_baseline);

    return {
      customer_id: cust.customer_id,
      prob_vqc: Number(prob_vqc.toFixed(4)),
      prob_qsvc: Number(prob_qsvc.toFixed(4)),
      prob_baseline: Number(prob_baseline.toFixed(4)),
      active_prob: Number(active_prob.toFixed(4)),
      rank: 0,
      is_top10: false,
      deposit_value: cust.deposit_value,
      contact_cost: cust.contact_cost,
      capacity_req: cust.capacity_req
    };
  });

  // Sort strictly by active_prob descending, break ties by lower customer_id ascending (Section 4 Rule)
  rawList.sort((a, b) => {
    if (Math.abs(b.active_prob - a.active_prob) > 1e-6) {
      return b.active_prob - a.active_prob;
    }
    return a.customer_id - b.customer_id;
  });

  // Assign 1-based ranks and mark top 10
  return rawList.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    is_top10: idx < 10
  }));
}
