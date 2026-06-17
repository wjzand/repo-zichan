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
