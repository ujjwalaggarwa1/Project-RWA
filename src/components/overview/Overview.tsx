import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Receipt, Wrench, type LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { currentBillingMonth, formatBillingMonth, formatCurrency } from '@/lib/format';
import { errorBannerClass } from '@/components/ui/styles';

interface DashboardStats {
  totalNotices: number;
  pinnedNotices: number;
  openComplaints: number;
  paidCount: number;
  totalDues: number;
  collected: number;
  outstanding: number;
}

interface StatCard {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  gradient: string;
}

const HERO_IMAGE =
  'https://images.pexels.com/photos/9170385/pexels-photo-9170385.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const billingMonth = currentBillingMonth();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [noticesResult, complaintsResult, duesResult] = await Promise.all([
        supabase.from('notices').select('id, pinned'),
        supabase.from('complaints').select('id, status').neq('status', 'resolved'),
        supabase.from('maintenance_dues').select('amount, status').eq('billing_month', billingMonth),
      ]);

      if (cancelled) return;

      if (noticesResult.error || complaintsResult.error || duesResult.error) {
        setError('Could not load the dashboard. Please try again.');
        return;
      }

      const notices = noticesResult.data ?? [];
      const dues = (duesResult.data ?? []).map((due) => ({ amount: Number(due.amount), status: due.status }));
      const paid = dues.filter((due) => due.status === 'paid');
      const collected = paid.reduce((sum, due) => sum + due.amount, 0);
      const totalDues = dues.reduce((sum, due) => sum + due.amount, 0);

      setError(null);
      setStats({
        totalNotices: notices.length,
        pinnedNotices: notices.filter((notice) => notice.pinned).length,
        openComplaints: complaintsResult.data?.length ?? 0,
        paidCount: paid.length,
        totalDues: dues.length,
        collected,
        outstanding: totalDues - collected,
      });
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [billingMonth]);

  const collectedPercent =
    stats && stats.totalDues > 0 ? Math.round((stats.paidCount / stats.totalDues) * 100) : 0;

  const cards: StatCard[] = stats
    ? [
        {
          label: 'Notices published',
          value: String(stats.totalNotices),
          detail: `${stats.pinnedNotices} pinned`,
          icon: Bell,
          gradient: 'from-sky-500 to-blue-600',
        },
        {
          label: 'Open complaints',
          value: String(stats.openComplaints),
          detail: stats.openComplaints === 0 ? 'Nothing waiting' : 'Needs attention',
          icon: Wrench,
          gradient: 'from-amber-400 to-orange-500',
        },
        {
          label: 'Dues collected',
          value: formatCurrency(stats.collected),
          detail: `${stats.paidCount} of ${stats.totalDues} flats paid`,
          icon: CheckCircle2,
          gradient: 'from-emerald-500 to-teal-600',
        },
        {
          label: 'Outstanding dues',
          value: formatCurrency(stats.outstanding),
          detail: formatBillingMonth(billingMonth),
          icon: Receipt,
          gradient: 'from-rose-500 to-pink-600',
        },
      ]
    : [];

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl shadow-teal-900/20">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-teal-800/70 to-emerald-700/30" />
        <div className="relative flex flex-col gap-6 p-6 sm:p-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
              {formatBillingMonth(billingMonth)}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Welcome to Neighbourly</h1>
            <p className="mt-3 text-sm leading-relaxed text-teal-50/90 sm:text-base">
              Notices, dues, bookings and complaints for every resident, all in one place.
            </p>
          </div>
          {stats && stats.totalDues > 0 && (
            <div className="w-full rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur md:w-72">
              <div className="flex items-center justify-between text-sm">
                <span className="text-teal-50">Collection progress</span>
                <span className="font-semibold">{collectedPercent}%</span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all duration-700"
                  style={{ width: `${collectedPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-teal-50/80">
                {stats.paidCount} of {stats.totalDues} flats have paid this month
              </p>
            </div>
          )}
        </div>
      </div>

      {error && <div className={errorBannerClass}>{error}</div>}

      {!stats && !error && <p className="text-sm text-slate-500">Loading dashboard...</p>}

      {stats && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.label}
              className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-md`}>
                <card.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
              <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${card.gradient} opacity-70 transition-opacity group-hover:opacity-100`} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
