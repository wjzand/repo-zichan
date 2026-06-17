import {
  LifeEvent,
  YearlySimulationPoint,
  LifePath,
  SimulationParams,
  SimulationConfig,
  Milestone,
  FinancialFreedomResult,
  LifeStage,
} from '@/types';
import {
  DEFAULT_PARAMS,
  getLifeStage,
  DEFAULT_MILESTONES,
} from '@/constants/lifeSandbox';
import { generateId } from './id';

const currentYear = new Date().getFullYear();

const calcMortgagePayment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  if (monthlyRate === 0) return principal / months;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return payment * 12;
};

interface Loan {
  eventId: string;
  type: 'house' | 'car';
  remainingPrincipal: number;
  annualRate: number;
  annualPayment: number;
  remainingYears: number;
}

export const runSimulation = (
  events: LifeEvent[],
  params: SimulationParams,
  config: SimulationConfig
): YearlySimulationPoint[] => {
  const results: YearlySimulationPoint[] = [];
  const { currentAge, retirementAge, lifeExpectancy } = params;

  let totalAssets = config.currentTotalAssets;
  let totalLiabilities = config.currentTotalLiabilities;
  let annualIncome = config.currentAnnualIncome;
  let baseAnnualExpense = config.currentAnnualExpense;
  let passiveIncome = 0;
  const activeLoans: Loan[] = [];

  let jobIncomeMultiplier = 1;
  let illnessReductionYears = 0;

  for (let age = currentAge; age <= lifeExpectancy; age++) {
    const year = currentYear + (age - currentAge);
    const eventsTriggered: string[] = [];
    const stage = getLifeStage(age).stage;
    let extraIncome = 0;
    let extraExpense = 0;
    let oneTimeIncome = 0;
    let oneTimeCost = 0;

    const ageEvents = events.filter((e) => e.age === age);
    for (const event of ageEvents) {
      eventsTriggered.push(event.id);

      switch (event.type) {
        case 'marriage':
          if (event.marriage) {
            extraIncome += event.marriage.spouseIncome;
            extraExpense += event.marriage.livingExpenseIncrease;
            oneTimeCost += event.marriage.weddingCost;
          }
          break;

        case 'child':
          if (event.child) {
            const baseCost = event.child.annualRearingCost * event.child.count;
            extraExpense += baseCost;
            if (event.child.universityCostPerYear && age >= 18 && age < 22) {
              const childYearsAfterBirth = age - event.age;
              if (childYearsAfterBirth >= 18 && childYearsAfterBirth < 22) {
                extraExpense += event.child.universityCostPerYear * event.child.count;
              }
            }
          }
          break;

        case 'buy-house':
          if (event.buyHouse) {
            const principal = event.buyHouse.totalPrice - event.buyHouse.downPayment;
            oneTimeCost += event.buyHouse.downPayment;
            totalLiabilities += principal;
            const annualPayment = calcMortgagePayment(
              principal,
              event.buyHouse.interestRate,
              event.buyHouse.loanYears
            );
            activeLoans.push({
              eventId: event.id,
              type: 'house',
              remainingPrincipal: principal,
              annualRate: event.buyHouse.interestRate,
              annualPayment,
              remainingYears: event.buyHouse.loanYears,
            });
          }
          break;

        case 'buy-car':
          if (event.buyCar) {
            if (event.buyCar.loanYears && event.buyCar.monthlyPayment) {
              const principal = event.buyCar.monthlyPayment * 12 * event.buyCar.loanYears;
              oneTimeCost += 0;
              totalLiabilities += principal;
              activeLoans.push({
                eventId: event.id,
                type: 'car',
                remainingPrincipal: principal,
                annualRate: 0.04,
                annualPayment: event.buyCar.monthlyPayment * 12,
                remainingYears: event.buyCar.loanYears,
              });
            } else {
              oneTimeCost += event.buyCar.price;
            }
          }
          break;

        case 'child-university':
          if (event.childUniversity) {
            const yearsSinceEvent = age - event.age;
            if (yearsSinceEvent < event.childUniversity.years) {
              extraExpense += event.childUniversity.annualCost;
            }
          }
          break;

        case 'job-change':
          if (event.jobChange) {
            jobIncomeMultiplier *= 1 + event.jobChange.incomeChangePercent / 100;
          }
          break;

        case 'startup':
          if (event.startup) {
            oneTimeCost += event.startup.initialInvestment;
            const yearsSinceStartup = age - event.age;
            if (yearsSinceStartup < event.startup.annualIncomeCurve.length) {
              extraIncome += event.startup.annualIncomeCurve[yearsSinceStartup];
            }
          }
          break;

        case 'inheritance':
          if (event.inheritance) {
            oneTimeIncome += event.inheritance.amount;
          }
          break;

        case 'illness':
          if (event.illness) {
            oneTimeCost += event.illness.medicalCost;
            illnessReductionYears = event.illness.incomeReductionYears;
            jobIncomeMultiplier *= 1 - event.illness.incomeReductionPercent / 100;
          }
          break;

        case 'early-retirement':
          if (event.earlyRetirement && event.earlyRetirement.retirementAge <= params.retirementAge) {
            params = { ...params, retirementAge: event.earlyRetirement.retirementAge };
          }
          break;

        case 'custom':
          if (event.custom) {
            if (event.custom.oneTimeCost) oneTimeCost += event.custom.oneTimeCost;
            if (event.custom.oneTimeIncome) oneTimeIncome += event.custom.oneTimeIncome;
            const yearsSinceEvent = age - event.age;
            if (event.custom.recurringAnnualCost && (!event.custom.costYears || yearsSinceEvent < event.custom.costYears)) {
              extraExpense += event.custom.recurringAnnualCost;
            }
            if (event.custom.recurringAnnualIncome && (!event.custom.incomeYears || yearsSinceEvent < event.custom.incomeYears)) {
              extraIncome += event.custom.recurringAnnualIncome;
            }
          }
          break;
      }
    }

    let currentIncome = annualIncome * jobIncomeMultiplier;
    if (age >= retirementAge) {
      const pensionReplacementRate = params.pensionReplacementRate;
      currentIncome = annualIncome * jobIncomeMultiplier * pensionReplacementRate;
    }

    if (illnessReductionYears > 0) {
      illnessReductionYears--;
    }

    let loanPayment = 0;
    for (const loan of activeLoans) {
      if (loan.remainingYears > 0) {
        loanPayment += loan.annualPayment;
        const interest = loan.remainingPrincipal * loan.annualRate;
        const principalPayment = loan.annualPayment - interest;
        loan.remainingPrincipal = Math.max(0, loan.remainingPrincipal - principalPayment);
        loan.remainingYears--;
        if (loan.remainingYears <= 0) {
          totalLiabilities = Math.max(0, totalLiabilities - (loan.type === 'house' ? loan.remainingPrincipal : 0));
        }
      }
    }

    if (age < retirementAge) {
      const growthRate =
        stage === 'youth'
          ? 0.08
          : stage === 'family'
          ? 0.05
          : stage === 'middle'
          ? 0.03
          : 0.01;
      annualIncome *= 1 + growthRate;
    }

    const annualExpense = baseAnnualExpense + extraExpense + loanPayment + oneTimeCost;
    currentIncome += extraIncome + oneTimeIncome;
    passiveIncome = totalAssets * params.investmentReturnRate;
    const netSavings = currentIncome + passiveIncome - annualExpense;
    totalAssets = Math.max(0, totalAssets + netSavings + oneTimeIncome);
    totalAssets *= 1 + params.inflationRate * 0.3;
    totalLiabilities *= 1;

    const netWorth = totalAssets - totalLiabilities;
    const isFinanciallyFree = passiveIncome >= annualExpense * 1.05 && netWorth > 0;

    results.push({
      age,
      year,
      income: Math.round(currentIncome),
      expense: Math.round(annualExpense),
      passiveIncome: Math.round(passiveIncome),
      totalAssets: Math.round(totalAssets),
      totalLiabilities: Math.round(totalLiabilities),
      netWorth: Math.round(netWorth),
      eventsTriggered,
      stage,
      isFinanciallyFree,
    });

    if (illnessReductionYears === 0 && age < retirementAge) {
    }
  }

  return results;
};

export const calculateFinancialFreedom = (
  simulation: YearlySimulationPoint[],
  params: SimulationParams,
  config: SimulationConfig
): FinancialFreedomResult => {
  const currentPoint = simulation[0];
  if (!currentPoint) {
    return { isFree: false, freedomIndex: 0 };
  }

  const currentExpense = currentPoint.expense;
  const currentPassiveIncome = currentPoint.passiveIncome;
  const currentNetWorth = currentPoint.netWorth;

  const freedomIndex =
    currentExpense > 0
      ? Math.min(100, Math.round((currentPassiveIncome / currentExpense) * 100))
      : 0;

  if (currentPassiveIncome >= currentExpense * 1.05 && currentNetWorth > 0) {
    return {
      isFree: true,
      freedomAge: params.currentAge,
      freedomNetWorth: currentNetWorth,
      freedomIndex: 100,
    };
  }

  let freedomAge: number | undefined;
  let freedomNetWorth: number | undefined;
  for (const point of simulation) {
    if (point.isFinanciallyFree) {
      freedomAge = point.age;
      freedomNetWorth = point.netWorth;
      break;
    }
  }

  const currentAnnualSavings = config.currentMonthlySavings * 12;
  const annualReturn = params.investmentReturnRate;
  const expenseFire = currentExpense * 25;
  const tip = generateFreedomTip(freedomIndex, currentAnnualSavings, annualReturn);

  return {
    isFree: false,
    freedomAge,
    freedomNetWorth,
    freedomIndex,
    projectedFreedomAge: freedomAge,
    tip,
  };
};

const generateFreedomTip = (
  index: number,
  annualSavings: number,
  returnRate: number
): string => {
  if (index >= 80) {
    return '恭喜！你离财务自由仅一步之遥，坚持当前储蓄习惯即可达成目标！';
  } else if (index >= 50) {
    const extra = Math.round((annualSavings * 0.2) / 12);
    return `若每月多储蓄${extra.toLocaleString()}元，可提前约3年实现财务自由！`;
  } else if (index >= 20) {
    const extra = Math.round((annualSavings * 0.3) / 12);
    return `尝试提高投资回报率或增加储蓄，每月多存${extra.toLocaleString()}元将显著加速自由进程`;
  } else {
    return '建议建立紧急备用金，逐步提高储蓄率，投资自己提升主动收入是当务之急';
  }
};

export const detectMilestones = (
  simulation: YearlySimulationPoint[],
  existingMilestones: Milestone[]
): Milestone[] => {
  const results: Milestone[] = [];
  const currentAge = simulation[0]?.age || 28;
  const currentNetWorth = simulation[0]?.netWorth || 0;
  const currentLiabilities = simulation[0]?.totalLiabilities || 0;
  const currentAssets = simulation[0]?.totalAssets || 1;
  const currentPassive = simulation[0]?.passiveIncome || 0;
  const currentExpense = simulation[0]?.expense || 1;
  const today = new Date().toISOString().slice(0, 10);

  const debtRatio = currentAssets > 0 ? currentLiabilities / currentAssets : 0;
  const passiveRatio = currentExpense > 0 ? currentPassive / currentExpense : 0;

  for (const template of DEFAULT_MILESTONES) {
    const existing = existingMilestones.find((m) => m.id === template.id);
    const milestone: Milestone = {
      ...template,
      achieved: false,
    };

    switch (template.type) {
      case 'net-worth':
        if (currentNetWorth >= (template.threshold || 0)) {
          milestone.achieved = true;
          milestone.achievedDate = existing?.achievedDate || today;
          milestone.achievedAge = currentAge;
        } else {
          for (const point of simulation) {
            if (point.netWorth >= (template.threshold || 0)) {
              milestone.predictedAge = point.age;
              break;
            }
          }
        }
        break;

      case 'debt-ratio':
        if (debtRatio <= (template.threshold || 0.3)) {
          milestone.achieved = true;
          milestone.achievedDate = existing?.achievedDate || today;
          milestone.achievedAge = currentAge;
        } else {
          for (const point of simulation) {
            const ratio =
              point.totalAssets > 0 ? point.totalLiabilities / point.totalAssets : 1;
            if (ratio <= (template.threshold || 0.3)) {
              milestone.predictedAge = point.age;
              break;
            }
          }
        }
        break;

      case 'passive-income':
        if (passiveRatio >= (template.threshold || 0.5)) {
          milestone.achieved = true;
          milestone.achievedDate = existing?.achievedDate || today;
          milestone.achievedAge = currentAge;
        } else {
          for (const point of simulation) {
            const ratio = point.expense > 0 ? point.passiveIncome / point.expense : 0;
            if (ratio >= (template.threshold || 0.5)) {
              milestone.predictedAge = point.age;
              break;
            }
          }
        }
        break;

      case 'freedom':
        for (const point of simulation) {
          if (point.isFinanciallyFree) {
            if (point.age === currentAge) {
              milestone.achieved = true;
              milestone.achievedDate = today;
              milestone.achievedAge = currentAge;
            } else {
              milestone.predictedAge = point.age;
            }
            break;
          }
        }
        break;

      case 'life-event':
        milestone.achieved = existing?.achieved || false;
        if (existing?.achieved) {
          milestone.achievedDate = existing.achievedDate;
          milestone.achievedAge = existing.achievedAge;
        }
        break;
    }

    results.push(milestone);
  }

  return results;
};

export const getPathKeyMetrics = (simulation: YearlySimulationPoint[]) => {
  if (simulation.length === 0) {
    return {
      freedomAge: undefined,
      maxNetWorth: 0,
      maxLiabilities: 0,
      retirementNetWorth: 0,
      avgAnnualSavings: 0,
    };
  }

  let freedomAge: number | undefined;
  let maxNetWorth = 0;
  let maxLiabilities = 0;
  let retirementNetWorth = 0;
  let totalSavings = 0;

  for (const point of simulation) {
    if (point.isFinanciallyFree && freedomAge === undefined) {
      freedomAge = point.age;
    }
    maxNetWorth = Math.max(maxNetWorth, point.netWorth);
    maxLiabilities = Math.max(maxLiabilities, point.totalLiabilities);
    totalSavings += point.income - point.expense;

    if (point.age >= 65 && retirementNetWorth === 0) {
      retirementNetWorth = point.netWorth;
    }
  }

  if (retirementNetWorth === 0 && simulation.length > 0) {
    const last = simulation[simulation.length - 1];
    if (last.age >= 65) retirementNetWorth = last.netWorth;
  }

  return {
    freedomAge,
    maxNetWorth,
    maxLiabilities,
    retirementNetWorth,
    avgAnnualSavings: Math.round(totalSavings / simulation.length),
  };
};

export interface CreatePathOptions {
  name: string;
  color: string;
  isDefault?: boolean;
}

export const createLifePath = (
  opts: CreatePathOptions,
  params: SimulationParams = DEFAULT_PARAMS
): Omit<LifePath, 'simulation'> => {
  const now = new Date().toISOString();
  return {
    id: generateId('lp_'),
    name: opts.name,
    color: opts.color,
    isDefault: opts.isDefault,
    events: [],
    params: {},
    createdAt: now,
    updatedAt: now,
  };
};
