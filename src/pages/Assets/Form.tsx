import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Image } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ASSET_CATEGORIES } from '@/constants/categories';
import { Header } from '@/components/layout/Header';
import { AmountInput } from '@/components/form/AmountInput';
import { CategorySelect } from '@/components/form/CategorySelect';
import { DatePicker } from '@/components/form/DatePicker';
import { Button } from '@/components/common/Button';

export const AssetFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const assets = useStore((s) => s.assets);
  const addAsset = useStore((s) => s.addAsset);
  const updateAsset = useStore((s) => s.updateAsset);
  const isEdit = !!id;
  const editingAsset = id ? assets.find((a) => a.id === id) : undefined;

  const [name, setName] = useState('');
  const [category, setCategory] = useState(ASSET_CATEGORIES[0].name);
  const [currentValue, setCurrentValue] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [interestRate, setInterestRate] = useState<number | ''>('');
  const [photo, setPhoto] = useState<string>('');

  useEffect(() => {
    if (editingAsset) {
      setName(editingAsset.name);
      setCategory(editingAsset.category);
      setCurrentValue(editingAsset.currentValue);
      setCost(editingAsset.cost || '');
      setDescription(editingAsset.description || '');
      setPurchaseDate(editingAsset.purchaseDate || '');
      setMaturityDate(editingAsset.maturityDate || '');
      setInterestRate(editingAsset.interestRate || '');
      setPhoto(editingAsset.photo || '');
    }
  }, [editingAsset]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('请输入资产名称');
      return;
    }
    if (!currentValue || currentValue <= 0) {
      alert('请输入有效的资产金额');
      return;
    }

    const data = {
      name: name.trim(),
      category,
      currentValue: Number(currentValue),
      cost: cost ? Number(cost) : undefined,
      description: description.trim() || undefined,
      purchaseDate: purchaseDate || undefined,
      maturityDate: maturityDate || undefined,
      interestRate: interestRate ? Number(interestRate) : undefined,
      photo: photo || undefined,
    };

    if (isEdit && id) {
      updateAsset(id, data);
    } else {
      addAsset(data);
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header title={isEdit ? '编辑资产' : '添加资产'} showBack />
      <div className="max-w-md mx-auto px-5 py-4 space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            资产名称<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：工商银行定期"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all"
          />
        </div>

        <CategorySelect
          label="资产类别"
          value={category}
          onChange={setCategory}
          categories={ASSET_CATEGORIES}
          required
          allowCustom
        />

        <AmountInput
          label="当前估值"
          value={currentValue}
          onChange={setCurrentValue}
          required
        />

        <AmountInput label="购买成本（可选）" value={cost} onChange={setCost} />

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
          <DatePicker label="购入日期" value={purchaseDate} onChange={setPurchaseDate} />
          <DatePicker label="到期日期" value={maturityDate} onChange={setMaturityDate} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">描述/备注</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="添加一些备注信息..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">照片（可选）</label>
          {photo ? (
            <div className="relative">
              <img
                src={photo}
                alt="资产照片"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => setPhoto('')}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors">
              <Camera size={24} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">点击上传照片</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
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
