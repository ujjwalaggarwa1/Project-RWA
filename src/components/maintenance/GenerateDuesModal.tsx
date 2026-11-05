import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/ui/Modal';
import { errorBannerClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '@/components/ui/styles';

interface GenerateDuesModalProps {
  billingMonth: string;
  billingMonthLabel: string;
  residentIds: string[];
  onClose: () => void;
  onGenerated: () => void;
}

export default function GenerateDuesModal({
  billingMonth,
  billingMonthLabel,
  residentIds,
  onClose,
  onGenerated,
}: GenerateDuesModalProps) {
  const [amount, setAmount] = useState('150');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (amount.trim() === '' || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError('Enter a valid monthly amount.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error: upsertError } = await supabase.from('maintenance_dues').upsert(
      residentIds.map((residentId) => ({
        resident_id: residentId,
        billing_month: billingMonth,
        amount: parsedAmount,
      })),
      { onConflict: 'resident_id,billing_month', ignoreDuplicates: true },
    );
    setSaving(false);
    if (upsertError) {
      setError('Could not generate dues. Please try again.');
      return;
    }
    onGenerated();
    onClose();
  };

  return (
    <Modal title={`Generate dues for ${billingMonthLabel}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className={errorBannerClass}>{error}</div>}
        <p className="text-sm text-slate-600">
          Creates a pending bill for every flat that does not already have one this month. Existing bills are left unchanged.
        </p>
        <div>
          <label htmlFor="due-amount" className={labelClass}>Monthly maintenance amount</label>
          <input
            id="due-amount"
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>Cancel</button>
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? 'Generating...' : 'Generate dues'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
