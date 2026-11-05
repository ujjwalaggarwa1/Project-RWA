import { useState } from 'react';
import { Bell, Calculator, CalendarDays, LayoutDashboard, Receipt, Wrench, type LucideIcon } from 'lucide-react';
import Overview from '@/components/overview/Overview';
import NoticeBoard from '@/components/notices/NoticeBoard';
import MaintenanceDues from '@/components/maintenance/MaintenanceDues';
import FeeCalculator from '@/components/calculator/FeeCalculator';
import AmenityBookings from '@/components/bookings/AmenityBookings';
import ComplaintsBoard from '@/components/complaints/ComplaintsBoard';

type View = 'overview' | 'notices' | 'maintenance' | 'calculator' | 'bookings' | 'complaints';

const navItems: { value: View; label: string; icon: LucideIcon }[] = [
  { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  { value: 'notices', label: 'Notices', icon: Bell },
  { value: 'maintenance', label: 'Maintenance', icon: Receipt },
  { value: 'calculator', label: 'Fee calculator', icon: Calculator },
  { value: 'bookings', label: 'Bookings', icon: CalendarDays },
  { value: 'complaints', label: 'Complaints', icon: Wrench },
];

function App() {
  const [view, setView] = useState<View>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Neighbourly" className="h-14 w-auto rounded-xl shadow-md" />
          </div>
          <nav aria-label="Main" className="flex w-full gap-1 overflow-x-auto rounded-2xl bg-slate-100/80 p-1 sm:w-auto">
            {navItems.map((item) => {
              const active = view === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setView(item.value)}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25'
                      : 'text-slate-600 hover:bg-white hover:text-teal-800'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div key={view} className="animate-fade-up">
          {view === 'overview' && <Overview />}
          {view === 'notices' && <NoticeBoard />}
          {view === 'maintenance' && <MaintenanceDues />}
          {view === 'calculator' && <FeeCalculator />}
          {view === 'bookings' && <AmenityBookings />}
          {view === 'complaints' && <ComplaintsBoard />}
        </div>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p className="font-medium text-slate-700">Neighbourly</p>
          <p>Notices, dues, bookings and complaints for a better community.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
