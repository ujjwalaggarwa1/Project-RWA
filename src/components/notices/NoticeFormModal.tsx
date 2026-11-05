import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/ui/Modal';
import { errorBannerClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '@/components/ui/styles';
import { NOTICE_TAGS } from '@/lib/notice-tags';
import type { NoticeTag } from '@/lib/types';

interface NoticeFormModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function NoticeFormModal({ onClose, onSaved }: NoticeFormModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState<NoticeTag>('general');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please give the notice a title.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from('notices').insert({
      title: trimmedTitle,
      body: body.trim(),
      tag,
      pinned,
    });
    setSaving(false);
    if (insertError) {
      setError('Could not publish the notice. Please try again.');
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <Modal title="New notice" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className={errorBannerClass}>{error}</div>}
        <div>
          <label htmlFor="notice-title" className={labelClass}>Title</label>
          <input
            id="notice-title"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Water supply interruption on Sunday"
            maxLength={120}
          />
        </div>
        <div>
          <label htmlFor="notice-body" className={labelClass}>Details</label>
          <textarea
            id="notice-body"
            className={`${inputClass} min-h-28 resize-y`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share the timing, reason and anything residents should do."
          />
        </div>
        <div>
          <label htmlFor="notice-tag" className={labelClass}>Priority tag</label>
          <select
            id="notice-tag"
            className={inputClass}
            value={tag}
            onChange={(e) => setTag(e.target.value as NoticeTag)}
          >
            {NOTICE_TAGS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
          />
          Pin to the top of the board
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>Cancel</button>
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? 'Publishing...' : 'Publish notice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
