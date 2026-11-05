import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AMENITIES, monthLastDayKey, toDateKey } from '@/lib/bookings';
import { currentBillingMonth, shiftBillingMonth } from '@/lib/format';
import type { AmenityBooking, Amenity, BookingSlot } from '@/lib/types';
import BookingCalendar from '@/components/bookings/BookingCalendar';
import DaySlots from '@/components/bookings/DaySlots';
import ReservationFormModal from '@/components/bookings/ReservationFormModal';
import { errorBannerClass } from '@/components/ui/styles';

export default function AmenityBookings() {
  const [amenity, setAmenity] = useState<Amenity>('clubhouse');
  const [month, setMonth] = useState(currentBillingMonth);
  const [today] = useState(() => toDateKey(new Date()));
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservingSlot, setReservingSlot] = useState<BookingSlot | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('amenity_bookings')
      .select('*')
      .eq('amenity', amenity)
      .gte('booking_date', month)
      .lte('booking_date', monthLastDayKey(month))
      .order('booking_date', { ascending: true });
    if (queryError) {
      setError('Could not load bookings. Please try again.');
    } else {
      setError(null);
      setBookings((data ?? []) as AmenityBooking[]);
    }
    setLoading(false);
  }, [amenity, month]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const shiftMonth = (delta: number) => {
    const nextMonth = shiftBillingMonth(month, delta);
    setMonth(nextMonth);
    setSelectedDate(nextMonth);
  };

  const cancelBooking = async (booking: AmenityBooking) => {
    if (!window.confirm(`Cancel ${booking.resident_name}'s booking for ${booking.slot}?`)) return;
    setBusyId(booking.id);
    const { error: deleteError } = await supabase.from('amenity_bookings').delete().eq('id', booking.id);
    setBusyId(null);
    if (deleteError) {
      setError('Could not cancel that booking. Please try again.');
      return;
    }
    await loadBookings();
  };

  const countsByDate = new Map<string, number>();
  bookings.forEach((booking) => {
    countsByDate.set(booking.booking_date, (countsByDate.get(booking.booking_date) ?? 0) + 1);
  });
  const bookingsForDay = bookings.filter((booking) => booking.booking_date === selectedDate);
  const amenityLabel = AMENITIES.find((option) => option.value === amenity)?.label ?? '';

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clubhouse and lawn bookings</h1>
          <p className="mt-1 text-sm text-slate-600">Pick a date, then reserve a free slot.</p>
        </div>
        <div role="tablist" aria-label="Amenity" className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {AMENITIES.map((option) => (
            <button
              key={option.value}
              role="tab"
              type="button"
              aria-selected={amenity === option.value}
              onClick={() => setAmenity(option.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                amenity === option.value ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {error && <div className={errorBannerClass}>{error}</div>}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BookingCalendar
            month={month}
            today={today}
            selectedDate={selectedDate}
            countsByDate={countsByDate}
            onSelectDate={setSelectedDate}
            onShiftMonth={shiftMonth}
          />
          {loading && <p className="mt-3 text-sm text-slate-500">Loading bookings...</p>}
        </div>
        <div className="lg:col-span-2">
          <DaySlots
            dateKey={selectedDate}
            today={today}
            bookings={bookingsForDay}
            busyId={busyId}
            onReserve={setReservingSlot}
            onCancel={cancelBooking}
          />
        </div>
      </div>

      {reservingSlot && (
        <ReservationFormModal
          amenity={amenity}
          amenityLabel={amenityLabel}
          dateKey={selectedDate}
          slot={reservingSlot}
          onClose={() => setReservingSlot(null)}
          onSaved={loadBookings}
        />
      )}
    </section>
  );
}
