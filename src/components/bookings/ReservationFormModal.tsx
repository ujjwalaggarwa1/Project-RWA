import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { BOOKING_SLOTS, formatDayLabel } from '@/lib/bookings';
import type { Amenity, BookingSlot } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import { errorBannerClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '@/components/ui/styles';

interface ReservationFormModalProps {
  amenity: Amenity;
  amenityLabel: string;
  dateKey: string;
  slot: BookingSlot;
  onClose: () => void;
  onSaved: () => void;
}

const DUPLICATE_KEY_CODE = '23505';

export default function ReservationFormModal({
  amenity,
  amenityLabel,
  dateKey,
  slot,
  onClose,
  onSaved,
}: ReservationFormModalProps) {
  const [residentName, setResidentName] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [guestCount, setGuestCount] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slotInfo = BOOKING_SLOTS.find((option) => option.value === slot);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = residentName.trim();
    const trimmedFlat = flatNumber.trim();
    const guests = Number(guestCount);
    if (!trimmedName || !trimmedFlat) {
      setError('Your name and flat number are required.');
      return;
    }
    if (!Number.isInteger(guests) || guests < 0 || guests > 1000) {
      setError('Enter a guest count between 0 and 1000.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from('amenity_bookings').insert({
      amenity,
      booking_date: dateKey,
      slot,
      resident_name: trimmedName,
      flat_number: trimmedFlat,
      purpose: purpose.trim(),
      guest_count: guests,
    });
    setSaving(false);
    if (insertError) {
      setError(
        insertError.code === DUPLICATE_KEY_CODE
          ? 'That slot was just reserved by someone else. Please pick another slot.'
          : 'Could not save your reservation. Please try again.',
      );
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <Modal title={`Reserve ${amenityLabel}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className={errorBannerClass}>{error}</div>}
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">{formatDayLabel(dateKey)}</p>
          <p>{slotInfo?.label} · {slotInfo?.time}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="booking-name" className={labelClass}>Your name</label>
            <input
              id="booking-name"
              className={inputClass}
              value={residentName}
              onChange={(e) => setResidentName(e.target.value)}
              maxLength={120}
            />
          </div>
          <div>
            <label htmlFor="booking-flat" className={labelClass}>Flat number</label>
            <input
              id="booking-flat"
              className={inputClass}
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              placeholder="A-101"
              maxLength={20}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="booking-purpose" className={labelClass}>Purpose (optional)</label>
            <input
              id="booking-purpose"
              className={inputClass}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Birthday party, family function..."
              maxLength={160}
            />
          </div>
          <div>
            <label htmlFor="booking-guests" className={labelClass}>Expected guests</label>
            <input
              id="booking-guests"
              type="number"
              min="0"
              max="1000"
              className={inputClass}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>Cancel</button>
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? 'Reserving...' : 'Confirm reservation'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
