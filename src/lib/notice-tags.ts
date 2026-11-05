import type { NoticeTag } from '@/lib/types';

export type NoticePriority = 'emergency' | 'important' | 'routine';

export const NOTICE_TAGS: { value: NoticeTag; label: string; priority: NoticePriority }[] = [
  { value: 'emergency_water_shutdown', label: 'Emergency Water Shutdown', priority: 'emergency' },
  { value: 'agm_meeting', label: 'AGM Meeting', priority: 'important' },
  { value: 'pest_control', label: 'Pest Control', priority: 'important' },
  { value: 'general', label: 'General', priority: 'routine' },
];

export const PRIORITY_STYLES: Record<NoticePriority, { badge: string; card: string }> = {
  emergency: {
    badge: 'bg-rose-600 text-white',
    card: 'border-rose-300 border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50 to-white ring-1 ring-rose-100',
  },
  important: {
    badge: 'bg-amber-100 text-amber-900',
    card: 'border-amber-200 border-l-4 border-l-amber-400 bg-white',
  },
  routine: {
    badge: 'bg-teal-100 text-teal-800',
    card: 'border-slate-200 border-l-4 border-l-teal-400 bg-white',
  },
};

export function getNoticeTag(tag: NoticeTag) {
  return NOTICE_TAGS.find((option) => option.value === tag) ?? NOTICE_TAGS[NOTICE_TAGS.length - 1];
}
