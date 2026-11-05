import { useCallback, useEffect, useState } from 'react';
import { Pin, PinOff, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/format';
import { PRIORITY_STYLES, getNoticeTag } from '@/lib/notice-tags';
import type { Notice } from '@/lib/types';
import NoticeFormModal from '@/components/notices/NoticeFormModal';
import { errorBannerClass, primaryButtonClass } from '@/components/ui/styles';

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('notices')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });
    if (queryError) {
      setError('Could not load notices. Please try again.');
    } else {
      setError(null);
      setNotices((data ?? []) as Notice[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const togglePin = async (notice: Notice) => {
    setBusyId(notice.id);
    const { error: updateError } = await supabase
      .from('notices')
      .update({ pinned: !notice.pinned })
      .eq('id', notice.id);
    setBusyId(null);
    if (updateError) {
      setError('Could not update that notice.');
      return;
    }
    await loadNotices();
  };

  const deleteNotice = async (notice: Notice) => {
    if (!window.confirm(`Delete "${notice.title}"? This cannot be undone.`)) return;
    setBusyId(notice.id);
    const { error: deleteError } = await supabase.from('notices').delete().eq('id', notice.id);
    setBusyId(null);
    if (deleteError) {
      setError('Could not delete that notice.');
      return;
    }
    await loadNotices();
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notice board</h1>
          <p className="mt-1 text-sm text-slate-600">Announcements visible to every resident.</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className={primaryButtonClass}>
          <Plus className="h-4 w-4" /> New notice
        </button>
      </header>

      {error && <div className={errorBannerClass}>{error}</div>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading notices...</p>
      ) : notices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-medium text-slate-800">No notices yet</p>
          <p className="mt-1 text-sm text-slate-500">Publish the first announcement for your residents.</p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {notices.map((notice) => (
            <li
              key={notice.id}
              className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                PRIORITY_STYLES[getNoticeTag(notice.tag).priority].card
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_STYLES[getNoticeTag(notice.tag).priority].badge}`}>
                    {getNoticeTag(notice.tag).label}
                  </span>
                  {notice.pinned && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-800">
                      <Pin className="h-3.5 w-3.5" /> Pinned
                    </span>
                  )}
                  <span className="text-xs text-slate-500">{formatDate(notice.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => togglePin(notice)}
                    disabled={busyId === notice.id}
                    aria-label={notice.pinned ? 'Unpin notice' : 'Pin notice'}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                  >
                    {notice.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteNotice(notice)}
                    disabled={busyId === notice.id}
                    aria-label="Delete notice"
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">{notice.title}</h2>
              {notice.body && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{notice.body}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <NoticeFormModal onClose={() => setShowForm(false)} onSaved={loadNotices} />
      )}
    </section>
  );
}
