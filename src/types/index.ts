export interface AssetHistory {
  value: number;
  date: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  cost?: number;
  description?: string;
  purchaseDate?: string;
  maturityDate?: string;
  interestRate?: number;
  photo?: string;
  createdAt: string;
  updatedAt: string;
  history: AssetHistory[];
}

export interface Repayment {
  amount: number;
  date: string;
  note?: string;
}

export interface Liability {
  id: string;
  name: string;
  category: string;
  totalLoan: number;
  remainingBalance: number;
  monthlyPayment: number;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
  nextPaymentDate?: string;
  note?: string;
  repayments: Repayment[];
}

export interface Snapshot {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface Settings {
  currency: string;
  firstDayOfMonth: number;
  autoSnapshot: boolean;
  remindBeforeDays: number;
}

export interface AppState {
  assets: Asset[];
  liabilities: Liability[];
  snapshots: Snapshot[];
  settings: Settings;
}

export interface CategoryItem {
  name: string;
  color: string;
  icon: string;
}

export type ReminderType = 'asset-maturity' | 'payment-due';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  date: string;
  daysLeft: number;
  amount?: number;
  relatedId: string;
}

// ==================== 人生沙盘相关类型 ====================

export type LifeEventType =
  | 'marriage'
  | 'child'
  | 'buy-house'
  | 'buy-car'
  | 'child-university'
  | 'job-change'
  | 'startup'
  | 'inheritance'
  | 'illness'
  | 'early-retirement'
  | 'custom';

export interface LifeEvent {
  id: string;
  type: LifeEventType;
  name: string;
  age: number;
  description?: string;

  marriage?: {
    spouseIncome: number;
    livingExpenseIncrease: number;
    weddingCost: number;
  };
  child?: {
    count: number;
    annualRearingCost: number;
    universityCostPerYear?: number;
  };
  buyHouse?: {
    totalPrice: number;
    downPayment: number;
    loanYears: number;
    interestRate: number;
  };
  buyCar?: {
    price: number;
    loanYears?: number;
    monthlyPayment?: number;
  };
  childUniversity?: {
    annualCost: number;
    years: number;
  };
  jobChange?: {
    incomeChangePercent: number;
  };
  startup?: {
    initialInvestment: number;
    annualIncomeCurve: number[];
  };
  inheritance?: {
    amount: number;
  };
  illness?: {
    medicalCost: number;
    incomeReductionYears: number;
    incomeReductionPercent: number;
  };
  earlyRetirement?: {
    retirementAge: number;
    pensionReplacementRate?: number;
  };
  custom?: {
    oneTimeCost?: number;
    recurringAnnualCost?: number;
    costYears?: number;
    oneTimeIncome?: number;
    recurringAnnualIncome?: number;
    incomeYears?: number;
  };
}

export type LifeStage = 'youth' | 'family' | 'middle' | 'pre-retirement' | 'retirement';

export interface LifeStageTemplate {
  stage: LifeStage;
  ageRange: [number, number];
  incomeGrowthRate: number;
  baseExpenseRatio: number;
  label: string;
  color: string;
}

export interface SimulationParams {
  inflationRate: number;
  investmentReturnRate: number;
  salaryGrowthRate: number;
  pensionReplacementRate: number;
  lifeExpectancy: number;
  currentAge: number;
  retirementAge: number;
}

export interface YearlySimulationPoint {
  age: number;
  year: number;
  income: number;
  expense: number;
  passiveIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  eventsTriggered: string[];
  stage: LifeStage;
  isFinanciallyFree?: boolean;
}

export interface LifePath {
  id: string;
  name: string;
  description?: string;
  color: string;
  events: LifeEvent[];
  params: Partial<SimulationParams>;
  simulation: YearlySimulationPoint[];
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  achieved: boolean;
  achievedDate?: string;
  achievedAge?: number;
  predictedAge?: number;
  threshold?: number;
  type: 'net-worth' | 'debt-ratio' | 'passive-income' | 'freedom' | 'life-event';
}

export interface FinancialFreedomResult {
  isFree: boolean;
  freedomAge?: number;
  freedomNetWorth?: number;
  freedomIndex: number;
  monthlySavingNeeded?: number;
  projectedFreedomAge?: number;
  tip?: string;
}

export interface SimulationConfig {
  currentNetWorth: number;
  currentTotalAssets: number;
  currentTotalLiabilities: number;
  currentAnnualIncome: number;
  currentAnnualExpense: number;
  currentMonthlySavings: number;
}

export interface LifeSandboxState {
  paths: LifePath[];
  activePathId: string;
  milestones: Milestone[];
  globalParams: SimulationParams;
  userProfile: {
    currentAge: number;
    gender?: 'male' | 'female';
    monthlyIncome?: number;
    monthlyExpense?: number;
  };
}
