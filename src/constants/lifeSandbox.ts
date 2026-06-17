import { LifeStageTemplate, LifeEventType, SimulationParams, Milestone, LifeEvent } from '@/types';

export const LIFE_STAGES: LifeStageTemplate[] = [
  {
    stage: 'youth',
    ageRange: [22, 30],
    incomeGrowthRate: 0.08,
    baseExpenseRatio: 0.6,
    label: '青年期',
    color: '#60a5fa',
  },
  {
    stage: 'family',
    ageRange: [30, 40],
    incomeGrowthRate: 0.05,
    baseExpenseRatio: 0.8,
    label: '成家立业期',
    color: '#34d399',
  },
  {
    stage: 'middle',
    ageRange: [40, 55],
    incomeGrowthRate: 0.03,
    baseExpenseRatio: 0.75,
    label: '中年期',
    color: '#fbbf24',
  },
  {
    stage: 'pre-retirement',
    ageRange: [55, 65],
    incomeGrowthRate: 0.01,
    baseExpenseRatio: 0.65,
    label: '退休前期',
    color: '#f87171',
  },
  {
    stage: 'retirement',
    ageRange: [65, 90],
    incomeGrowthRate: 0,
    baseExpenseRatio: 0.7,
    label: '退休期',
    color: '#a78bfa',
  },
];

export const DEFAULT_PARAMS: SimulationParams = {
  inflationRate: 0.025,
  investmentReturnRate: 0.05,
  salaryGrowthRate: 0.03,
  pensionReplacementRate: 0.4,
  lifeExpectancy: 90,
  currentAge: 28,
  retirementAge: 65,
};

export interface LifeEventTemplate {
  type: LifeEventType;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultAge: number;
}

export const LIFE_EVENT_TEMPLATES: LifeEventTemplate[] = [
  {
    type: 'marriage',
    name: '结婚',
    description: '增加配偶收入，新增共同支出',
    icon: '💍',
    color: '#f472b6',
    defaultAge: 28,
  },
  {
    type: 'child',
    name: '生子',
    description: '增加子女养育支出',
    icon: '👶',
    color: '#60a5fa',
    defaultAge: 30,
  },
  {
    type: 'buy-house',
    name: '购房',
    description: '大额支出 + 长期房贷',
    icon: '🏠',
    color: '#f59e0b',
    defaultAge: 32,
  },
  {
    type: 'buy-car',
    name: '购车',
    description: '一次性支出或车贷',
    icon: '🚗',
    color: '#10b981',
    defaultAge: 27,
  },
  {
    type: 'child-university',
    name: '子女上大学',
    description: '4年高额教育支出',
    icon: '🎓',
    color: '#8b5cf6',
    defaultAge: 48,
  },
  {
    type: 'job-change',
    name: '跳槽换工作',
    description: '收入一次性调整',
    icon: '💼',
    color: '#06b6d4',
    defaultAge: 26,
  },
  {
    type: 'startup',
    name: '创业',
    description: '高风险高回报',
    icon: '🚀',
    color: '#ef4444',
    defaultAge: 30,
  },
  {
    type: 'inheritance',
    name: '继承遗产',
    description: '获得额外资产',
    icon: '🎁',
    color: '#84cc16',
    defaultAge: 50,
  },
  {
    type: 'illness',
    name: '重大疾病',
    description: '医疗支出 + 收入减少',
    icon: '🏥',
    color: '#f43f5e',
    defaultAge: 55,
  },
  {
    type: 'early-retirement',
    name: '提前退休',
    description: '提前结束职业生涯',
    icon: '🏝️',
    color: '#0ea5e9',
    defaultAge: 55,
  },
  {
    type: 'custom',
    name: '自定义事件',
    description: '自定义收入/支出',
    icon: '✨',
    color: '#64748b',
    defaultAge: 35,
  },
];

export const DEFAULT_MILESTONES: Omit<Milestone, 'achieved' | 'achievedDate' | 'achievedAge' | 'predictedAge'>[] = [
  {
    id: 'm_10w',
    name: '第一桶金',
    description: '净资产首次达到10万元',
    icon: '🥇',
    threshold: 100000,
    type: 'net-worth',
  },
  {
    id: 'm_50w',
    name: '半百万户',
    description: '净资产达到50万元',
    icon: '💰',
    threshold: 500000,
    type: 'net-worth',
  },
  {
    id: 'm_100w',
    name: '百万富翁',
    description: '净资产达到100万元',
    icon: '💎',
    threshold: 1000000,
    type: 'net-worth',
  },
  {
    id: 'm_500w',
    name: '中产进阶',
    description: '净资产达到500万元',
    icon: '👑',
    threshold: 5000000,
    type: 'net-worth',
  },
  {
    id: 'm_low_debt',
    name: '轻装上阵',
    description: '负债率低于30%',
    icon: '🕊️',
    threshold: 0.3,
    type: 'debt-ratio',
  },
  {
    id: 'm_half_passive',
    name: '被动半覆盖',
    description: '被动收入覆盖50%支出',
    icon: '📈',
    threshold: 0.5,
    type: 'passive-income',
  },
  {
    id: 'm_clear_mortgage',
    name: '无债一身轻',
    description: '还清所有房贷',
    icon: '🏡',
    type: 'life-event',
  },
  {
    id: 'm_financial_freedom',
    name: '财务自由',
    description: '被动收入 > 年度支出',
    icon: '🌟',
    type: 'freedom',
  },
];

export const LIFE_PATH_COLORS = [
  '#1e3a5f',
  '#d4a84b',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
];

export const DEFAULT_EVENTS_BASE: Omit<LifeEvent, 'id'>[] = [
  {
    type: 'marriage',
    name: '结婚',
    age: 28,
    marriage: {
      spouseIncome: 120000,
      livingExpenseIncrease: 30000,
      weddingCost: 100000,
    },
  },
  {
    type: 'buy-house',
    name: '购房',
    age: 32,
    buyHouse: {
      totalPrice: 3000000,
      downPayment: 900000,
      loanYears: 30,
      interestRate: 0.042,
    },
  },
  {
    type: 'child',
    name: '生子',
    age: 33,
    child: {
      count: 1,
      annualRearingCost: 40000,
      universityCostPerYear: 30000,
    },
  },
];

export const getLifeStage = (age: number): LifeStageTemplate => {
  for (const stage of LIFE_STAGES) {
    if (age >= stage.ageRange[0] && age < stage.ageRange[1]) {
      return stage;
    }
  }
  return LIFE_STAGES[LIFE_STAGES.length - 1];
};

export const getEventTemplate = (type: LifeEventType): LifeEventTemplate | undefined => {
  return LIFE_EVENT_TEMPLATES.find((t) => t.type === type);
};
