const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function currentBillingMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export function shiftBillingMonth(month: string, delta: number): string {
  const [year, mon] = month.split('-').map(Number);
  const date = new Date(year, mon - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

export function formatBillingMonth(month: string): string {
  const [year, mon] = month.split('-').map(Number);
  return new Date(year, mon - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
