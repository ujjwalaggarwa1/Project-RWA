import type { Amenity, BookingSlot } from '@/lib/types';

export const AMENITIES: { value: Amenity; label: string; description: string }[] = [
  { value: 'clubhouse', label: 'Clubhouse', description: 'Indoor hall for meetings and small celebrations' },
  { value: 'party_lawn', label: 'Party lawn', description: 'Open lawn for larger gatherings' },
];

export const BOOKING_SLOTS: { value: BookingSlot; label: string; time: string }[] = [
  { value: 'morning', label: 'Morning', time: '8:00 AM - 12:00 PM' },
  { value: 'afternoon', label: 'Afternoon', time: '1:00 PM - 5:00 PM' },
  { value: 'evening', label: 'Evening', time: '6:00 PM - 10:00 PM' },
];

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function monthLastDayKey(monthStart: string): string {
  const [year, month] = monthStart.split('-').map(Number);
  return toDateKey(new Date(year, month, 0));
}

export function buildMonthGrid(monthStart: string): (string | null)[] {
  const [year, month] = monthStart.split('-').map(Number);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDateKey(new Date(year, month - 1, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function formatDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
