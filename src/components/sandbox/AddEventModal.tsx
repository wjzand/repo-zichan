import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { AmountInput } from '@/components/form/AmountInput';
import { LIFE_EVENT_TEMPLATES, getEventTemplate, type LifeEventTemplate } from '@/constants/lifeSandbox';
import { type LifeEvent, type LifeEventType } from '@/types';
import { cn } from '@/lib/utils';

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<LifeEvent, 'id'>) => void;
  defaultAge: number;
}

type Step = 1 | 2;

interface CommonFormState {
  name: string;
  age: number | '';
  description: string;
}

interface MarriageForm {
  spouseIncome: number | '';
  livingExpenseIncrease: number | '';
  weddingCost: number | '';
}

interface ChildForm {
  count: number | '';
  annualRearingCost: number | '';
}

interface BuyHouseForm {
  totalPrice: number | '';
  downPayment: number | '';
  loanYears: number | '';
  interestRate: number | '';
}

interface BuyCarForm {
  price: number | '';
  isLoan: boolean;
  loanYears: number | '';
}

interface JobChangeForm {
  incomeChangePercent: number | '';
}

interface InheritanceForm {
  amount: number | '';
}

interface StartupForm {
  initialInvestment: number | '';
  annualIncomeCurveStr: string;
}

interface IllnessForm {
  medicalCost: number | '';
  incomeReductionYears: number | '';
  incomeReductionPercent: number | '';
}

interface EarlyRetirementForm {
  retirementAge: number | '';
}

interface ChildUniversityForm {
  annualCost: number | '';
  years: number | '';
}

interface CustomForm {
  oneTimeCost: number | '';
  recurringAnnualCost: number | '';
  costYears: number | '';
  oneTimeIncome: number | '';
  recurringAnnualIncome: number | '';
  incomeYears: number | '';
}

type TypeFormState =
  | MarriageForm
  | ChildForm
  | BuyHouseForm
  | BuyCarForm
  | JobChangeForm
  | InheritanceForm
  | StartupForm
  | IllnessForm
  | EarlyRetirementForm
  | ChildUniversityForm
  | CustomForm;

const getInitialTypeForm = (type: LifeEventType): TypeFormState => {
  switch (type) {
    case 'marriage':
      return { spouseIncome: '', livingExpenseIncrease: '', weddingCost: '' };
    case 'child':
      return { count: '', annualRearingCost: '' };
    case 'buy-house':
      return { totalPrice: '', downPayment: '', loanYears: '', interestRate: '' };
    case 'buy-car':
      return { price: '', isLoan: false, loanYears: '' };
    case 'job-change':
      return { incomeChangePercent: '' };
    case 'inheritance':
      return { amount: '' };
    case 'startup':
      return { initialInvestment: '', annualIncomeCurveStr: '' };
    case 'illness':
      return { medicalCost: '', incomeReductionYears: '', incomeReductionPercent: '' };
    case 'early-retirement':
      return { retirementAge: '' };
    case 'child-university':
      return { annualCost: '', years: '' };
    case 'custom':
      return {
        oneTimeCost: '',
        recurringAnnualCost: '',
        costYears: '',
        oneTimeIncome: '',
        recurringAnnualIncome: '',
        incomeYears: '',
      };
  }
};

export const AddEventModal = ({ open, onClose, onSubmit, defaultAge }: AddEventModalProps) => {
  const [step, setStep] = useState<Step>(1);
  const [selectedType, setSelectedType] = useState<LifeEventType | null>(null);
  const [commonForm, setCommonForm] = useState<CommonFormState>({
    name: '',
    age: '',
    description: '',
  });
  const [typeForm, setTypeForm] = useState<TypeFormState | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedType(null);
      setCommonForm({ name: '', age: '', description: '' });
      setTypeForm(null);
    }
  }, [open]);

  const handleSelectType = (template: LifeEventTemplate) => {
    setSelectedType(template.type);
    setCommonForm({
      name: template.name,
      age: defaultAge || template.defaultAge,
      description: '',
    });
    setTypeForm(getInitialTypeForm(template.type));
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    if (!selectedType || !typeForm) return;

    const baseEvent: Omit<LifeEvent, 'id'> = {
      type: selectedType,
      name: commonForm.name,
      age: typeof commonForm.age === 'number' ? commonForm.age : defaultAge,
      description: commonForm.description || undefined,
    };

    switch (selectedType) {
      case 'marriage': {
        const f = typeForm as MarriageForm;
        onSubmit({
          ...baseEvent,
          marriage: {
            spouseIncome: typeof f.spouseIncome === 'number' ? f.spouseIncome : 0,
            livingExpenseIncrease: typeof f.livingExpenseIncrease === 'number' ? f.livingExpenseIncrease : 0,
            weddingCost: typeof f.weddingCost === 'number' ? f.weddingCost : 0,
          },
        });
        break;
      }
      case 'child': {
        const f = typeForm as ChildForm;
        onSubmit({
          ...baseEvent,
          child: {
            count: typeof f.count === 'number' ? f.count : 1,
            annualRearingCost: typeof f.annualRearingCost === 'number' ? f.annualRearingCost : 0,
          },
        });
        break;
      }
      case 'buy-house': {
        const f = typeForm as BuyHouseForm;
        onSubmit({
          ...baseEvent,
          buyHouse: {
            totalPrice: typeof f.totalPrice === 'number' ? f.totalPrice : 0,
            downPayment: typeof f.downPayment === 'number' ? f.downPayment : 0,
            loanYears: typeof f.loanYears === 'number' ? f.loanYears : 30,
            interestRate: typeof f.interestRate === 'number' ? f.interestRate / 100 : 0,
          },
        });
        break;
      }
      case 'buy-car': {
        const f = typeForm as BuyCarForm;
        onSubmit({
          ...baseEvent,
          buyCar: {
            price: typeof f.price === 'number' ? f.price : 0,
            loanYears: f.isLoan && typeof f.loanYears === 'number' ? f.loanYears : undefined,
          },
        });
        break;
      }
      case 'job-change': {
        const f = typeForm as JobChangeForm;
        onSubmit({
          ...baseEvent,
          jobChange: {
            incomeChangePercent: typeof f.incomeChangePercent === 'number' ? f.incomeChangePercent / 100 : 0,
          },
        });
        break;
      }
      case 'inheritance': {
        const f = typeForm as InheritanceForm;
        onSubmit({
          ...baseEvent,
          inheritance: {
            amount: typeof f.amount === 'number' ? f.amount : 0,
          },
        });
        break;
      }
      case 'startup': {
        const f = typeForm as StartupForm;
        const curve = f.annualIncomeCurveStr
          .split(',')
          .map((s) => parseFloat(s.trim()))
          .filter((n) => !isNaN(n));
        onSubmit({
          ...baseEvent,
          startup: {
            initialInvestment: typeof f.initialInvestment === 'number' ? f.initialInvestment : 0,
            annualIncomeCurve: curve,
          },
        });
        break;
      }
      case 'illness': {
        const f = typeForm as IllnessForm;
        onSubmit({
          ...baseEvent,
          illness: {
            medicalCost: typeof f.medicalCost === 'number' ? f.medicalCost : 0,
            incomeReductionYears: typeof f.incomeReductionYears === 'number' ? f.incomeReductionYears : 0,
            incomeReductionPercent: typeof f.incomeReductionPercent === 'number' ? f.incomeReductionPercent / 100 : 0,
          },
        });
        break;
      }
      case 'early-retirement': {
        const f = typeForm as EarlyRetirementForm;
        onSubmit({
          ...baseEvent,
          earlyRetirement: {
            retirementAge: typeof f.retirementAge === 'number' ? f.retirementAge : 55,
          },
        });
        break;
      }
      case 'child-university': {
        const f = typeForm as ChildUniversityForm;
        onSubmit({
          ...baseEvent,
          childUniversity: {
            annualCost: typeof f.annualCost === 'number' ? f.annualCost : 0,
            years: typeof f.years === 'number' ? f.years : 4,
          },
        });
        break;
      }
      case 'custom': {
        const f = typeForm as CustomForm;
        onSubmit({
          ...baseEvent,
          custom: {
            oneTimeCost: typeof f.oneTimeCost === 'number' ? f.oneTimeCost : undefined,
            recurringAnnualCost: typeof f.recurringAnnualCost === 'number' ? f.recurringAnnualCost : undefined,
            costYears: typeof f.costYears === 'number' ? f.costYears : undefined,
            oneTimeIncome: typeof f.oneTimeIncome === 'number' ? f.oneTimeIncome : undefined,
            recurringAnnualIncome: typeof f.recurringAnnualIncome === 'number' ? f.recurringAnnualIncome : undefined,
            incomeYears: typeof f.incomeYears === 'number' ? f.incomeYears : undefined,
          },
        });
        break;
      }
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">选择一个人生事件类型开始规划</p>
      <div className="grid grid-cols-2 gap-3">
        {LIFE_EVENT_TEMPLATES.map((template) => (
          <Card
            key={template.type}
            padding="sm"
            onClick={() => handleSelectType(template)}
            className={cn(
              'relative overflow-hidden group active:scale-[0.97]',
              'border-2 border-transparent hover:border-[#d4a84b]/50',
              'transition-all duration-200'
            )}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: template.color }}
            />
            <div className="flex flex-col items-start gap-2 pt-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${template.color}15` }}
              >
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-semibold text-sm text-gray-900">{template.name}</h4>
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-[#d4a84b]" />
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCommonFields = () => {
    const template = selectedType ? getEventTemplate(selectedType) : undefined;
    return (
      <div className="space-y-4 mb-5">
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: `${template?.color}10` }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: `${template?.color}20` }}
          >
            {template?.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{template?.name}</p>
            <p className="text-xs text-gray-500">{template?.description}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            事件名称<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={commonForm.name}
            onChange={(e) => setCommonForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="请输入事件名称"
            className={cn(
              'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50',
              'text-sm text-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
              'transition-all'
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            触发年龄<span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">岁</span>
            <input
              type="number"
              min={0}
              max={120}
              value={commonForm.age}
              onChange={(e) => {
                const val = e.target.value;
                setCommonForm((prev) => ({
                  ...prev,
                  age: val === '' ? '' : parseInt(val, 10),
                }));
              }}
              placeholder="请输入年龄"
              className={cn(
                'w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50',
                'text-right text-sm font-semibold tabular-nums text-gray-900',
                'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                'transition-all placeholder:text-gray-300'
              )}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            备注描述<span className="text-gray-400 text-xs font-normal ml-1">（可选）</span>
          </label>
          <textarea
            value={commonForm.description}
            onChange={(e) => setCommonForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="添加备注说明..."
            rows={3}
            className={cn(
              'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 resize-none',
              'text-sm text-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
              'transition-all placeholder:text-gray-300'
            )}
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <p className="text-xs font-semibold text-[#1e3a5f] flex items-center gap-1">
          <span className="w-1 h-4 rounded-full bg-[#d4a84b]" />
          专属参数
        </p>
      </div>
    );
  };

  const renderTypeSpecificFields = () => {
    if (!selectedType || !typeForm) return null;

    switch (selectedType) {
      case 'marriage': {
        const f = typeForm as MarriageForm;
        const updater = (key: keyof MarriageForm) => (val: number | '') =>
          setTypeForm((prev) => (prev ? { ...(prev as MarriageForm), [key]: val } : prev));
        return (
          <div className="space-y-4">
            <AmountInput label="配偶年收入" value={f.spouseIncome} onChange={updater('spouseIncome')} />
            <AmountInput label="生活支出年增加" value={f.livingExpenseIncrease} onChange={updater('livingExpenseIncrease')} />
            <AmountInput label="婚礼总费用" value={f.weddingCost} onChange={updater('weddingCost')} />
          </div>
        );
      }
      case 'child': {
        const f = typeForm as ChildForm;
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                子女数量<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={f.count}
                onChange={(e) => {
                  const val = e.target.value;
                  setTypeForm((prev) =>
                    prev
                      ? { ...(prev as ChildForm), count: val === '' ? '' : parseInt(val, 10) }
                      : prev
                  );
                }}
                placeholder="请输入数量"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50',
                  'text-right text-sm font-semibold tabular-nums text-gray-900',
                  'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                  'transition-all'
                )}
              />
            </div>
            <AmountInput
              label="子女年养育成本"
              value={f.annualRearingCost}
              onChange={(val) =>
                setTypeForm((prev) =>
                  prev ? { ...(prev as ChildForm), annualRearingCost: val } : prev
                )
              }
            />
          </div>
        );
      }
      case 'buy-house': {
        const f = typeForm as BuyHouseForm;
        return (
          <div className="space-y-4">
            <AmountInput label="房屋总价" value={f.totalPrice} onChange={(val) =>
              setTypeForm((prev) => prev ? { ...(prev as BuyHouseForm), totalPrice: val } : prev)
            } />
            <AmountInput label="首付金额" value={f.downPayment} onChange={(val) =>
              setTypeForm((prev) => prev ? { ...(prev as BuyHouseForm), downPayment: val } : prev)
            } />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                贷款年限<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">年</span>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={f.loanYears}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypeForm((prev) =>
                      prev
                        ? { ...(prev as BuyHouseForm), loanYears: val === '' ? '' : parseInt(val, 10) }
                        : prev
                    );
                  }}
                  placeholder="如 30"
                  className={cn(
                    'w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50',
                    'text-right text-sm font-semibold tabular-nums text-gray-900',
                    'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                    'transition-all'
                  )}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                贷款利率<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">%</span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={30}
                  value={f.interestRate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypeForm((prev) =>
                      prev
                        ? { ...(prev as BuyHouseForm), interestRate: val === '' ? '' : parseFloat(val) }
                        : prev
                    );
                  }}
                  placeholder="如 4.2"
                  className={cn(
                    'w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50',
                    'text-right text-sm font-semibold tabular-nums text-gray-900',
                    'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                    'transition-all'
                  )}
                />
              </div>
            </div>
          </div>
        );
      }
      case 'buy-car': {
        const f = typeForm as BuyCarForm;
        return (
          <div className="space-y-4">
            <AmountInput label="车辆总价" value={f.price} onChange={(val) =>
              setTypeForm((prev) => prev ? { ...(prev as BuyCarForm), price: val } : prev)
            } />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">是否贷款</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTypeForm((prev) => prev ? { ...(prev as BuyCarForm), isLoan: false } : prev)}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-sm font-medium transition-all border-2',
                    !f.isLoan
                      ? 'bg-[#1e3a5f] text-white border-[#d4a84b]/30'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  )}
                >
                  全款
                </button>
                <button
                  type="button"
                  onClick={() => setTypeForm((prev) => prev ? { ...(prev as BuyCarForm), isLoan: true } : prev)}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-sm font-medium transition-all border-2',
                    f.isLoan
                      ? 'bg-[#1e3a5f] text-white border-[#d4a84b]/30'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  )}
                >
                  贷款
                </button>
              </div>
            </div>
            {f.isLoan && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  贷款年限<span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">年</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={f.loanYears}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTypeForm((prev) =>
                        prev
                          ? { ...(prev as BuyCarForm), loanYears: val === '' ? '' : parseInt(val, 10) }
                          : prev
                      );
                    }}
                    placeholder="如 3"
                    className={cn(
                      'w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50',
                      'text-right text-sm font-semibold tabular-nums text-gray-900',
                      'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                      'transition-all'
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'job-change': {
        const f = typeForm as JobChangeForm;
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                收入变化百分比<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">%</span>
                <input
                  type="number"
                  step="1"
                  value={f.incomeChangePercent}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypeForm((prev) =>
                      prev
                        ? { ...(prev as JobChangeForm), incomeChangePercent: val === '' ? '' : parseFloat(val) }
                        : prev
                    );
                  }}
                  placeholder="正数涨薪，负数降薪，如 20"
                  className={cn(
                    'w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50',
                    'text-right text-sm font-semibold tabular-nums text-gray-900',
                    'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                    'transition-all'
                  )}
                />
              </div>
              <p className="text-xs text-gray-400">提示：涨薪20%输入 20，降薪10%输入 -10</p>
            </div>
          </div>
        );
      }
      case 'inheritance': {
        const f = typeForm as InheritanceForm;
        return (
          <div className="space-y-4">
            <AmountInput label="继承金额" value={f.amount} onChange={(val) =>
              setTypeForm((prev) => prev ? { ...(prev as InheritanceForm), amount: val } : prev)
            } />
          </div>
        );
      }
      case 'startup': {
        const f = typeForm as StartupForm;
        return (
          <div className="space-y-4">
            <AmountInput label="启动资金" value={f.initialInvestment} onChange={(val) =>
              setTypeForm((prev) => prev ? { ...(prev as StartupForm), initialInvestment: val } : prev)
            } />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                预期年收入曲线<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={f.annualIncomeCurveStr}
                onChange={(e) =>
                  setTypeForm((prev) =>
                    prev ? { ...(prev as StartupForm), annualIncomeCurveStr: e.target.value } : prev
                  )
                }
                placeholder="用逗号分隔，如：0,50000,200000,500000"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50',
                  'text-sm text-gray-800',
                  'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                  'transition-all placeholder:text-gray-300'
                )}
              />
              <p className="text-xs text-gray-400">按年填写，从第1年开始，用逗号分隔数字</p>
            </div>
          </div>
        );
      }
      case 'illness': {
        const f = typeForm as IllnessForm;
        return (
          <div className="space-y-4">
            <AmountInput label="医疗费用总额" value={f.medicalCost} onChange={(val) =>
              setTypeForm((prev) => prev ? { ...(prev as IllnessForm), medicalCost: val } : prev)
            } />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                收入减少年数<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">年</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={f.incomeReductionYears}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypeForm((prev) =>
                      prev
                        ? { ...(prev as IllnessForm), incomeReductionYears: val === '' ? '' : parseInt(val, 10) }
                        : prev
                    );
                  }}
                  placeholder="如 2"
                  className={cn(
                    'w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50',
                    'text-right text-sm font-semibold tabular-nums text-gray-900',
                    'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                    'transition-all'
                  )}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                收入减少比例<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">%</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={f.incomeReductionPercent}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypeForm((prev) =>
                      prev
                        ? { ...(prev as IllnessForm), incomeReductionPercent: val === '' ? '' : parseFloat(val) }
                        : prev
                    );
                  }}
                  placeholder="如 50"
                  className={cn(
                    'w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50',
                    'text-right text-sm font-semibold tabular-nums text-gray-900',
                    'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                    'transition-all'
                  )}
                />
              </div>
            </div>
          </div>
        );
      }
      case 'early-retirement': {
        const f = typeForm as EarlyRetirementForm;
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                计划退休年龄<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">岁</span>
                <input
                  type="number"
                  min={30}
                  max={80}
                  value={f.retirementAge}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypeForm((prev) =>
                      prev
                        ? { ...(prev as EarlyRetirementForm), retirementAge: val === '' ? '' : parseInt(val, 10) }
                        : prev
                    );
                  }}
                  placeholder="如 55"
                  className={cn(
                    'w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50',
                    'text-right text-sm font-semibold tabular-nums text-gray-900',
                    'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                    'transition-all'
                  )}
                />
              </div>
            </div>
          </div>
        );
      }
      case 'child-university': {
        const f = typeForm as ChildUniversityForm;
        return (
          <div className="space-y-4">
            <AmountInput label="年学费" value={f.annualCost} onChange={(val) =>
              setTypeForm((prev) => prev ? { ...(prev as ChildUniversityForm), annualCost: val } : prev)
            } />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                就读年数<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">年</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={f.years}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypeForm((prev) =>
                      prev
                        ? { ...(prev as ChildUniversityForm), years: val === '' ? '' : parseInt(val, 10) }
                        : prev
                    );
                  }}
                  placeholder="如 4"
                  className={cn(
                    'w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50',
                    'text-right text-sm font-semibold tabular-nums text-gray-900',
                    'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                    'transition-all'
                  )}
                />
              </div>
            </div>
          </div>
        );
      }
      case 'custom': {
        const f = typeForm as CustomForm;
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-red-600 mb-3 flex items-center gap-1">
                <span className="w-1 h-3 rounded-full bg-red-400" />
                支出
              </p>
              <div className="space-y-4">
                <AmountInput
                  label="一次性支出"
                  value={f.oneTimeCost}
                  onChange={(val) =>
                    setTypeForm((prev) =>
                      prev ? { ...(prev as CustomForm), oneTimeCost: val } : prev
                    )
                  }
                />
                <AmountInput
                  label="年度支出"
                  value={f.recurringAnnualCost}
                  onChange={(val) =>
                    setTypeForm((prev) =>
                      prev ? { ...(prev as CustomForm), recurringAnnualCost: val } : prev
                    )
                  }
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">支出持续年数</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">年</span>
                    <input
                      type="number"
                      min={0}
                      value={f.costYears}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTypeForm((prev) =>
                          prev
                            ? { ...(prev as CustomForm), costYears: val === '' ? '' : parseInt(val, 10) }
                            : prev
                        );
                      }}
                      placeholder="如 5"
                      className={cn(
                        'w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50',
                        'text-right text-sm font-semibold tabular-nums text-gray-900',
                        'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                        'transition-all'
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 mb-3 flex items-center gap-1">
                <span className="w-1 h-3 rounded-full bg-emerald-400" />
                收入
              </p>
              <div className="space-y-4">
                <AmountInput
                  label="一次性收入"
                  value={f.oneTimeIncome}
                  onChange={(val) =>
                    setTypeForm((prev) =>
                      prev ? { ...(prev as CustomForm), oneTimeIncome: val } : prev
                    )
                  }
                />
                <AmountInput
                  label="年度收入"
                  value={f.recurringAnnualIncome}
                  onChange={(val) =>
                    setTypeForm((prev) =>
                      prev ? { ...(prev as CustomForm), recurringAnnualIncome: val } : prev
                    )
                  }
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">收入持续年数</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">年</span>
                    <input
                      type="number"
                      min={0}
                      value={f.incomeYears}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTypeForm((prev) =>
                          prev
                            ? { ...(prev as CustomForm), incomeYears: val === '' ? '' : parseInt(val, 10) }
                            : prev
                        );
                      }}
                      placeholder="如 10"
                      className={cn(
                        'w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50',
                        'text-right text-sm font-semibold tabular-nums text-gray-900',
                        'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50',
                        'transition-all'
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  const renderStep2 = () => (
    <div className="space-y-1 pb-4">
      {renderCommonFields()}
      {renderTypeSpecificFields()}
    </div>
  );

  const title = step === 1 ? '添加人生事件' : selectedType ? `${getEventTemplate(selectedType)?.name || ''} · 详情` : '';

  const footer =
    step === 1 ? (
      <Button variant="secondary" fullWidth onClick={onClose}>
        取消
      </Button>
    ) : (
      <>
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft size={16} className="mr-1" />
          返回
        </Button>
        <Button variant="secondary" onClick={onClose}>
          取消
        </Button>
        <Button variant="primary" onClick={handleSubmit} className="flex-1">
          确定
        </Button>
      </>
    );

  return (
    <Modal open={open} onClose={onClose} title={title} footer={footer}>
      {step === 1 ? renderStep1() : renderStep2()}
    </Modal>
  );
};
