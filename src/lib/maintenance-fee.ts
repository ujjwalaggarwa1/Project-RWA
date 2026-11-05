export interface FeeInputs {
  areaSqft: number;
  ratePerSqft: number;
  fixedCharges: number;
  daysLate: number;
  graceDays: number;
  finePercentPerMonth: number;
  maxFinePercent: number;
}

export interface FeeBreakdown {
  areaCharge: number;
  baseTotal: number;
  lateMonths: number;
  fine: number;
  payable: number;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateFee(inputs: FeeInputs): FeeBreakdown {
  const areaCharge = roundCurrency(inputs.areaSqft * inputs.ratePerSqft);
  const baseTotal = roundCurrency(areaCharge + inputs.fixedCharges);

  const overdueDays = Math.max(0, inputs.daysLate - inputs.graceDays);
  const lateMonths = overdueDays === 0 ? 0 : Math.ceil(overdueDays / 30);

  const uncappedFine = baseTotal * (inputs.finePercentPerMonth / 100) * lateMonths;
  const fineCap = baseTotal * (inputs.maxFinePercent / 100);
  const fine = roundCurrency(Math.min(uncappedFine, fineCap));

  return {
    areaCharge,
    baseTotal,
    lateMonths,
    fine,
    payable: roundCurrency(baseTotal + fine),
  };
}
