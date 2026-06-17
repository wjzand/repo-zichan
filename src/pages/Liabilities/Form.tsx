import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { LIABILITY_CATEGORIES } from '@/constants/categories';
import { Header } from '@/components/layout/Header';
import { AmountInput } from '@/components/form/AmountInput';
import { CategorySelect } from '@/components/form/CategorySelect';
import { DatePicker } from '@/components/form/DatePicker';
import { Button } from '@/components/common/Button';

export const LiabilityFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const liabilities = useStore((s) => s.liabilities);
  const addLiability = useStore((s) => s.addLiability);
  const updateLiability = useStore((s) => s.updateLiability);
  const isEdit = !!id;
  const editingLiability = id ? liabilities.find((l) => l.id === id) : undefined;

  const [name, setName] = useState('');
  const [category, setCategory] = useState(LIABILITY_CATEGORIES[0].name);
  const [totalLoan, setTotalLoan] = useState<number | ''>('');
  const [remainingBalance, setRemainingBalance] = useState<number | ''>('');
  const [monthlyPayment, setMonthlyPayment] = useState<number | ''>('');
  const [interestRate, setInterestRate] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (editingLiability) {
      setName(editingLiability.name);
      setCategory(editingLiability.category);
      setTotalLoan(editingLiability.totalLoan);
      setRemainingBalance(editingLiability.remainingBalance);
      setMonthlyPayment(editingLiability.monthlyPayment);
      setInterestRate(editingLiability.interestRate || '');
      setStartDate(editingLiability.startDate || '');
      setEndDate(editingLiability.endDate || '');
      setNextPaymentDate(editingLiability.nextPaymentDate || '');
      setNote(editingLiability.note || '');
    }
  }, [editingLiability]);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('请输入负债名称');
      return;
    }
    if (!totalLoan || totalLoan <= 0) {
      alert('请输入有效的总借款额');
      return;
    }
    if (remainingBalance === '' || remainingBalance < 0) {
      alert('请输入有效的剩余应还总额');
      return;
    }
    if (!monthlyPayment || monthlyPayment <= 0) {
      alert('请输入有效的月还款额');
      return;
    }

    const data = {
      name: name.trim(),
      category,
      totalLoan: Number(totalLoan),
      remainingBalance: Number(remainingBalance),
      monthlyPayment: Number(monthlyPayment),
      interestRate: interestRate ? Number(interestRate) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      nextPaymentDate: nextPaymentDate || undefined,
      note: note.trim() || undefined,
    };

    if (isEdit && id) {
      updateLiability(id, data);
    } else {
      addLiability(data);
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header title={isEdit ? '编辑负债' : '添加负债'} showBack />
      <div className="max-w-md mx-auto px-5 py-4 space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            负债名称<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：房贷-招商银行"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all"
          />
        </div>

        <CategorySelect
          label="负债类别"
          value={category}
          onChange={setCategory}
          categories={LIABILITY_CATEGORIES}
          required
          allowCustom
        />

        <AmountInput
          label="总借款额"
          value={totalLoan}
          onChange={setTotalLoan}
          required
        />

        <AmountInput
          label="剩余应还总额"
          value={remainingBalance}
          onChange={setRemainingBalance}
          required
        />

        <AmountInput
          label="月还款额"
          value={monthlyPayment}
          onChange={setMonthlyPayment}
          required
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">年化利率（%）</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={interestRate}
            onChange={(e) =>
              setInterestRate(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder="0.00"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DatePicker label="开始日期" value={startDate} onChange={setStartDate} />
          <DatePicker label="结束日期" value={endDate} onChange={setEndDate} />
        </div>

        <DatePicker
          label="下一个还款日"
          value={nextPaymentDate}
          onChange={setNextPaymentDate}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">备注</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加一些备注信息..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all resize-none"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-bottom z-50">
        <div className="max-w-md mx-auto flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => navigate(-1)}>
            取消
          </Button>
          <Button fullWidth onClick={handleSubmit}>
            {isEdit ? '保存修改' : '确认添加'}
          </Button>
        </div>
      </div>
    </div>
  );
};
