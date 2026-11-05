import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/ui/Modal';
import { errorBannerClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '@/components/ui/styles';
import type { ComplaintCategory } from '@/lib/types';

interface NewComplaintModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const categories: { value: ComplaintCategory; label: string }[] = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'security', label: 'Security' },
  { value: 'lift', label: 'Lift' },
  { value: 'parking', label: 'Parking' },
  { value: 'other', label: 'Other' },
];

export default function NewComplaintModal({ onClose, onSaved }: NewComplaintModalProps) {
  const [flatNumber, setFlatNumber] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('plumbing');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedFlat = flatNumber.trim();
    const trimmedDescription = description.trim();
    if (!trimmedFlat || !trimmedDescription) {
      setError('Flat number and a description are required.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from('complaints').insert({
      flat_number: trimmedFlat,
      category,
      description: trimmedDescription,
    });
    setSaving(false);
    if (insertError) {
      setError('Could not submit the complaint. Please try again.');
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <Modal title="Log a complaint" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className={errorBannerClass}>{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="complaint-flat" className={labelClass}>Flat number</label>
            <input
              id="complaint-flat"
              className={inputClass}
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              placeholder="A-101"
              maxLength={20}
            />
          </div>
          <div>
            <label htmlFor="complaint-category" className={labelClass}>Category</label>
            <select
              id="complaint-category"
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
            >
              {categories.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="complaint-description" className={labelClass}>What is the problem?</label>
          <textarea
            id="complaint-description"
            className={`${inputClass} min-h-28 resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue and where it is happening."
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>Cancel</button>
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? 'Submitting...' : 'Submit complaint'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
