import { useCallback, useEffect, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { currentBillingMonth, formatBillingMonth, formatCurrency, shiftBillingMonth } from '@/lib/format';
import type { MaintenanceDue, Resident } from '@/lib/types';
import DuesTable, { type DuesRow } from '@/components/maintenance/DuesTable';
import GenerateDuesModal from '@/components/maintenance/GenerateDuesModal';
import AddResidentModal from '@/components/maintenance/AddResidentModal';
import { errorBannerClass, primaryButtonClass, secondaryButtonClass } from '@/components/ui/styles';

export default function MaintenanceDues() {
  const [billingMonth, setBillingMonth] = useState(currentBillingMonth);
  const [rows, setRows] = useState<DuesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyDueId, setBusyDueId] = useState<string | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showAddResident, setShowAddResident] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [residentsResult, duesResult] = await Promise.all([
      supabase.from('residents').select('*').order('flat_number', { ascending: true }),
      supabase.from('maintenance_dues').select('*').eq('billing_month', billingMonth),
    ]);

    if (residentsResult.error || duesResult.error) {
      setError('Could not load maintenance dues. Please try again.');
      setLoading(false);
      return;
    }

    const duesByResident = new Map(
      ((duesResult.data ?? []) as MaintenanceDue[]).map((due) => [due.resident_id, due]),
    );
    const residents = (residentsResult.data ?? []) as Resident[];
    setRows(residents.map((resident) => ({ resident, due: duesByResident.get(resident.id) ?? null })));
    setError(null);
    setLoading(false);
  }, [billingMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const togglePaid = async (due: MaintenanceDue) => {
    const markingPaid = due.status === 'pending';
    setBusyDueId(due.id);
    const { error: updateError } = await supabase
      .from('maintenance_dues')
      .update({
        status: markingPaid ? 'paid' : 'pending',
        paid_at: markingPaid ? new Date().toISOString() : null,
      })
      .eq('id', due.id);
    setBusyDueId(null);
    if (updateError) {
      setError('Could not update that payment. Please try again.');
      return;
    }
    await loadData();
  };

  const billedRows = rows.filter((row) => row.due !== null);
  const collected = billedRows
    .filter((row) => row.due?.status === 'paid')
    .reduce((sum, row) => sum + Number(row.due?.amount ?? 0), 0);
  const billed = billedRows.reduce((sum, row) => sum + Number(row.due?.amount ?? 0), 0);
  const paidCount = billedRows.filter((row) => row.due?.status === 'paid').length;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Maintenance dues</h1>
          <p className="mt-1 text-sm text-slate-600">Track which flats have paid for each billing month.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowAddResident(true)} className={secondaryButtonClass}>
            <UserPlus className="h-4 w-4" /> Add flat
          </button>
          <button type="button" onClick={() => setShowGenerate(true)} disabled={rows.length === 0} className={primaryButtonClass}>
            <CalendarPlus className="h-4 w-4" /> Generate dues
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBillingMonth((month) => shiftBillingMonth(month, -1))}
            aria-label="Previous month"
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="min-w-44 text-center font-semibold text-slate-900">{formatBillingMonth(billingMonth)}</p>
          <button
            type="button"
            onClick={() => setBillingMonth((month) => shiftBillingMonth(month, 1))}
            aria-label="Next month"
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{formatCurrency(collected)}</span> collected of{' '}
          {formatCurrency(billed)} · {paidCount} of {billedRows.length} paid
        </div>
      </div>

      {error && <div className={errorBannerClass}>{error}</div>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading dues...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-medium text-slate-800">No flats added yet</p>
          <p className="mt-1 text-sm text-slate-500">Add your flats first, then generate dues for the month.</p>
        </div>
      ) : (
        <DuesTable rows={rows} busyDueId={busyDueId} onTogglePaid={togglePaid} />
      )}

      {showGenerate && (
        <GenerateDuesModal
          billingMonthLabel={formatBillingMonth(billingMonth)}
          billingMonth={billingMonth}
          residentIds={rows.map((row) => row.resident.id)}
          onClose={() => setShowGenerate(false)}
          onGenerated={loadData}
        />
      )}

      {showAddResident && (
        <AddResidentModal onClose={() => setShowAddResident(false)} onSaved={loadData} />
      )}
    </section>
  );
}
