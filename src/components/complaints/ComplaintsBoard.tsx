import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/format';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '@/lib/types';
import NewComplaintModal from '@/components/complaints/NewComplaintModal';
import { errorBannerClass, primaryButtonClass } from '@/components/ui/styles';

type Filter = 'all' | ComplaintStatus;

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
];

const statusOptions: { value: ComplaintStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
];

const categoryLabels: Record<ComplaintCategory, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  housekeeping: 'Housekeeping',
  security: 'Security',
  lift: 'Lift',
  parking: 'Parking',
  other: 'Other',
};

const statusStyles: Record<ComplaintStatus, string> = {
  open: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-teal-100 text-teal-800',
  resolved: 'bg-emerald-100 text-emerald-800',
};

export default function ComplaintsBoard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });
    if (queryError) {
      setError('Could not load complaints. Please try again.');
    } else {
      setError(null);
      setComplaints((data ?? []) as Complaint[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const changeStatus = async (complaint: Complaint, status: ComplaintStatus) => {
    setBusyId(complaint.id);
    const { error: updateError } = await supabase
      .from('complaints')
      .update({
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', complaint.id);
    setBusyId(null);
    if (updateError) {
      setError('Could not update that complaint.');
      return;
    }
    await loadComplaints();
  };

  const visible = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Facility complaints</h1>
          <p className="mt-1 text-sm text-slate-600">Follow every issue from report to resolution.</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className={primaryButtonClass}>
          <Plus className="h-4 w-4" /> Log complaint
        </button>
      </header>

      <div role="tablist" aria-label="Filter complaints" className="flex flex-wrap gap-2">
        {filters.map((option) => (
          <button
            key={option.value}
            role="tab"
            aria-selected={filter === option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === option.value
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && <div className={errorBannerClass}>{error}</div>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading complaints...</p>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-medium text-slate-800">No complaints here</p>
          <p className="mt-1 text-sm text-slate-500">Complaints matching this filter will appear here.</p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {visible.map((complaint) => (
            <li key={complaint.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-900">Flat {complaint.flat_number}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {categoryLabels[complaint.category]}
                  </span>
                  <span className="text-xs text-slate-500">Reported {formatDate(complaint.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[complaint.status]}`}>
                    {statusOptions.find((option) => option.value === complaint.status)?.label}
                  </span>
                  <select
                    aria-label="Change complaint status"
                    value={complaint.status}
                    disabled={busyId === complaint.id}
                    onChange={(e) => changeStatus(complaint, e.target.value as ComplaintStatus)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-50"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{complaint.description}</p>
              {complaint.resolved_at && (
                <p className="mt-2 text-xs text-emerald-700">Resolved {formatDate(complaint.resolved_at)}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {showForm && <NewComplaintModal onClose={() => setShowForm(false)} onSaved={loadComplaints} />}
    </section>
  );
}
