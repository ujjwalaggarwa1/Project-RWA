import { useState, type ReactNode } from 'react';
import { Calculator } from 'lucide-react';
import { calculateFee, type FeeInputs } from '@/lib/maintenance-fee';
import { formatCurrency } from '@/lib/format';
import { inputClass, labelClass } from '@/components/ui/styles';

type FormState = Record<keyof FeeInputs, string>;

const defaultForm: FormState = {
  areaSqft: '1200',
  ratePerSqft: '1.5',
  fixedCharges: '50',
  daysLate: '0',
  graceDays: '10',
  finePercentPerMonth: '2',
  maxFinePercent: '20',
};

function toInputs(form: FormState): FeeInputs {
  const read = (value: string) => Math.max(0, Number(value) || 0);
  return {
    areaSqft: read(form.areaSqft),
    ratePerSqft: read(form.ratePerSqft),
    fixedCharges: read(form.fixedCharges),
    daysLate: read(form.daysLate),
    graceDays: read(form.graceDays),
    finePercentPerMonth: read(form.finePercentPerMonth),
    maxFinePercent: read(form.maxFinePercent),
  };
}

interface FieldProps {
  id: keyof FeeInputs;
  label: string;
  hint?: string;
  value: string;
  step?: string;
  onChange: (id: keyof FeeInputs, value: string) => void;
}

function Field({ id, label, hint, value, step = '1', onChange }: FieldProps) {
  return (
    <div>
      <label htmlFor={`fee-${id}`} className={labelClass}>{label}</label>
      <input
        id={`fee-${id}`}
        type="number"
        min="0"
        step={step}
        inputMode="decimal"
        className={inputClass}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function ResultRow({ label, value, emphasis = false }: { label: string; value: ReactNode; emphasis?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${emphasis ? 'mt-2 border-t border-white/25 pt-4' : 'border-b border-white/10'}`}>
      <dt className={emphasis ? 'font-semibold text-white' : 'text-sm text-teal-50/85'}>{label}</dt>
      <dd className={emphasis ? 'text-2xl font-bold text-amber-300' : 'text-sm font-semibold text-white'}>{value}</dd>
    </div>
  );
}

export default function FeeCalculator() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const breakdown = calculateFee(toInputs(form));
  const hasFine = breakdown.fine > 0;

  const handleChange = (id: keyof FeeInputs, value: string) => {
    setForm((current) => ({ ...current, [id]: value }));
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Maintenance fee calculator</h1>
        <p className="mt-1 text-sm text-slate-600">Estimate a flat's monthly charge from its size, plus any late fine.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Monthly charge</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="areaSqft" label="Flat area (sq ft)" value={form.areaSqft} onChange={handleChange} />
            <Field id="ratePerSqft" label="Rate per sq ft" value={form.ratePerSqft} step="0.01" onChange={handleChange} />
            <Field id="fixedCharges" label="Fixed charges" hint="Water, security, etc." value={form.fixedCharges} step="0.01" onChange={handleChange} />
          </div>

          <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Late payment</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="daysLate" label="Days past due date" value={form.daysLate} onChange={handleChange} />
            <Field id="graceDays" label="Grace period (days)" value={form.graceDays} onChange={handleChange} />
            <Field id="finePercentPerMonth" label="Fine per 30 days (%)" hint="Charged on the monthly charge." value={form.finePercentPerMonth} step="0.1" onChange={handleChange} />
            <Field id="maxFinePercent" label="Maximum fine (%)" hint="Fine never exceeds this share." value={form.maxFinePercent} step="0.1" onChange={handleChange} />
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 p-6 text-white shadow-xl shadow-teal-900/20 lg:col-span-2">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl" />
          <div className="relative flex items-center gap-2 text-amber-300">
            <Calculator className="h-5 w-5" />
            <h2 className="font-semibold text-white">Estimate</h2>
          </div>
          <dl className="relative mt-4">
            <ResultRow label="Area charge" value={formatCurrency(breakdown.areaCharge)} />
            <ResultRow label="Fixed charges" value={formatCurrency(Math.max(0, Number(form.fixedCharges) || 0))} />
            <ResultRow label="Monthly charge" value={formatCurrency(breakdown.baseTotal)} />
            <ResultRow
              label={hasFine ? `Late fine (${breakdown.lateMonths} ${breakdown.lateMonths === 1 ? 'block' : 'blocks'} of 30 days)` : 'Late fine'}
              value={formatCurrency(breakdown.fine)}
            />
            <ResultRow label="Total payable" value={formatCurrency(breakdown.payable)} emphasis />
          </dl>
          <p className="relative mt-4 text-xs leading-relaxed text-teal-100/80">
            The fine starts after the grace period and is charged for each started block of 30 days, up to the maximum.
          </p>
        </aside>
      </div>
    </section>
  );
}
