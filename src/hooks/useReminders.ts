import { useMemo } from 'react';
import { Reminder } from '@/types';
import { useStore } from '@/store/useStore';
import { getDaysDiff } from '@/utils/format';

export const useReminders = () => {
  const assets = useStore((s) => s.assets);
  const liabilities = useStore((s) => s.liabilities);
  const remindBeforeDays = useStore((s) => s.settings.remindBeforeDays);

  const reminders = useMemo<Reminder[]>(() => {
    const list: Reminder[] = [];

    assets.forEach((asset) => {
      if (!asset.maturityDate) return;
      const daysLeft = getDaysDiff(asset.maturityDate);
      if (daysLeft >= 0 && daysLeft <= 7) {
        list.push({
          id: `m_${asset.id}`,
          type: 'asset-maturity',
          title: `${asset.name} 即将到期`,
          date: asset.maturityDate,
          daysLeft,
          amount: asset.currentValue,
          relatedId: asset.id,
        });
      }
    });

    liabilities.forEach((liability) => {
      if (!liability.nextPaymentDate) return;
      const daysLeft = getDaysDiff(liability.nextPaymentDate);
      if (daysLeft >= 0 && daysLeft <= remindBeforeDays) {
        list.push({
          id: `p_${liability.id}`,
          type: 'payment-due',
          title: `${liability.name} 需还款`,
          date: liability.nextPaymentDate,
          daysLeft,
          amount: liability.monthlyPayment,
          relatedId: liability.id,
        });
      }
    });

    return list.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [assets, liabilities, remindBeforeDays]);

  const todayPayments = useMemo(
    () => reminders.filter((r) => r.daysLeft === 0 && r.type === 'payment-due'),
    [reminders]
  );

  const urgentReminders = useMemo(
    () => reminders.filter((r) => r.daysLeft <= remindBeforeDays),
    [reminders, remindBeforeDays]
  );

  return {
    reminders,
    todayPayments,
    urgentReminders,
    hasReminders: reminders.length > 0,
  };
};
