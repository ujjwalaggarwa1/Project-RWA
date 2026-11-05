import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildMonthGrid } from '@/lib/bookings';
import { formatBillingMonth } from '@/lib/format';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface BookingCalendarProps {
  month: string;
  today: string;
  selectedDate: string;
  countsByDate: Map<string, number>;
  onSelectDate: (dateKey: string) => void;
  onShiftMonth: (delta: number) => void;
}

export default function BookingCalendar({
  month,
  today,
  selectedDate,
  countsByDate,
  onSelectDate,
  onShiftMonth,
}: BookingCalendarProps) {
  const cells = buildMonthGrid(month);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onShiftMonth(-1)}
          aria-label="Previous month"
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-semibold text-slate-900">{formatBillingMonth(month)}</p>
        <button
          type="button"
          onClick={() => onShiftMonth(1)}
          aria-label="Next month"
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-2 text-center text-xs font-semibold uppercase text-slate-500">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateKey, index) => {
          if (!dateKey) return <div key={`empty-${index}`} />;

          const booked = countsByDate.get(dateKey) ?? 0;
          const isPast = dateKey < today;
          const isSelected = dateKey === selectedDate;
          const isToday = dateKey === today;
          const dayNumber = Number(dateKey.slice(-2));

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              aria-pressed={isSelected}
              aria-label={`${dateKey}, ${booked} of 3 slots booked`}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                isSelected
                  ? 'bg-gradient-to-br from-teal-600 to-emerald-600 font-semibold text-white shadow-md shadow-teal-600/30'
                  : isPast
                    ? 'text-slate-400 hover:bg-slate-50'
                    : 'text-slate-800 hover:bg-teal-50'
              } ${isToday && !isSelected ? 'ring-1 ring-teal-600' : ''}`}
            >
              <span>{dayNumber}</span>
              {booked > 0 && (
                <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-600'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
