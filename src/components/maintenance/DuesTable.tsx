import { CheckCircle2, Circle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import type { MaintenanceDue, Resident } from '@/lib/types';

export interface DuesRow {
  resident: Resident;
  due: MaintenanceDue | null;
}

interface DuesTableProps {
  rows: DuesRow[];
  busyDueId: string | null;
  onTogglePaid: (due: MaintenanceDue) => void;
}

export default function DuesTable({ rows, busyDueId, onTogglePaid }: DuesTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Flat</th>
            <th className="px-5 py-3">Resident</th>
            <th className="px-5 py-3">Amount</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(({ resident, due }) => {
            const isPaid = due?.status === 'paid';
            return (
              <tr key={resident.id} className="transition-colors hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{resident.flat_number}</td>
                <td className="px-5 py-4 text-slate-700">{resident.full_name}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                  {due ? formatCurrency(Number(due.amount)) : '-'}
                </td>
                <td className="px-5 py-4">
                  {!due ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Not billed</span>
                  ) : isPaid ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Paid{due.paid_at ? ` ${formatDate(due.paid_at)}` : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      <Circle className="h-3.5 w-3.5" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  {due && (
                    <button
                      type="button"
                      onClick={() => onTogglePaid(due)}
                      disabled={busyDueId === due.id}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        isPaid
                          ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          : 'bg-teal-700 text-white hover:bg-teal-800'
                      }`}
                    >
                      {isPaid ? 'Mark pending' : 'Mark paid'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
