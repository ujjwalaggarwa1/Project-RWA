import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/ui/Modal';
import { errorBannerClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '@/components/ui/styles';

interface AddResidentModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const DUPLICATE_KEY_CODE = '23505';

export default function AddResidentModal({ onClose, onSaved }: AddResidentModalProps) {
  const [fullName, setFullName] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedFlat = flatNumber.trim();
    if (!trimmedName || !trimmedFlat) {
      setError('Name and flat number are required.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from('residents').insert({
      full_name: trimmedName,
      flat_number: trimmedFlat,
      phone: phone.trim() || null,
      email: email.trim() || null,
    });
    setSaving(false);
    if (insertError) {
      setError(
        insertError.code === DUPLICATE_KEY_CODE
          ? `Flat ${trimmedFlat} is already registered.`
          : 'Could not add this flat. Please try again.',
      );
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <Modal title="Add a flat" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className={errorBannerClass}>{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="resident-flat" className={labelClass}>Flat number</label>
            <input
              id="resident-flat"
              className={inputClass}
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              placeholder="A-101"
              maxLength={20}
            />
          </div>
          <div>
            <label htmlFor="resident-name" className={labelClass}>Resident name</label>
            <input
              id="resident-name"
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Priya Sharma"
              maxLength={120}
            />
          </div>
          <div>
            <label htmlFor="resident-phone" className={labelClass}>Phone (optional)</label>
            <input
              id="resident-phone"
              type="tel"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="resident-email" className={labelClass}>Email (optional)</label>
            <input
              id="resident-email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>Cancel</button>
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? 'Saving...' : 'Add flat'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
