import { Trash2 } from 'lucide-react';
import { BOOKING_SLOTS, formatDayLabel } from '@/lib/bookings';
import type { AmenityBooking, BookingSlot } from '@/lib/types';
import { primaryButtonClass } from '@/components/ui/styles';

interface DaySlotsProps {
  dateKey: string;
  today: string;
  bookings: AmenityBooking[];
  busyId: string | null;
  onReserve: (slot: BookingSlot) => void;
  onCancel: (booking: AmenityBooking) => void;
}

export default function DaySlots({ dateKey, today, bookings, busyId, onReserve, onCancel }: DaySlotsProps) {
  const isPast = dateKey < today;
  const bookingsBySlot = new Map(bookings.map((booking) => [booking.slot, booking]));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900">{formatDayLabel(dateKey)}</h2>
      <p className="mt-1 text-sm text-slate-500">
        {isPast ? 'This date has passed.' : 'Choose a slot to reserve it for your event.'}
      </p>

      <ul className="mt-4 space-y-3">
        {BOOKING_SLOTS.map((slot) => {
          const booking = bookingsBySlot.get(slot.value);

          if (booking) {
            return (
              <li key={slot.value} className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{slot.label} · Reserved</p>
                    <p className="text-xs text-slate-500">{slot.time}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCancel(booking)}
                    disabled={busyId === booking.id}
                    aria-label={`Cancel ${slot.label.toLowerCase()} booking`}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white hover:text-rose-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-slate-500">Booked by</dt>
                  <dd className="font-medium text-slate-900">{booking.resident_name}</dd>
                  <dt className="text-slate-500">Flat</dt>
                  <dd className="font-medium text-slate-900">{booking.flat_number}</dd>
                  <dt className="text-slate-500">Guests</dt>
                  <dd className="font-medium text-slate-900">{booking.guest_count}</dd>
                  {booking.purpose && (
                    <>
                      <dt className="text-slate-500">Purpose</dt>
                      <dd className="font-medium text-slate-900">{booking.purpose}</dd>
                    </>
                  )}
                </dl>
              </li>
            );
          }

          return (
            <li
              key={slot.value}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{slot.label} · Available</p>
                <p className="text-xs text-slate-500">{slot.time}</p>
              </div>
              <button
                type="button"
                onClick={() => onReserve(slot.value)}
                disabled={isPast}
                className={`${primaryButtonClass} px-3 py-1.5`}
              >
                Reserve
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
