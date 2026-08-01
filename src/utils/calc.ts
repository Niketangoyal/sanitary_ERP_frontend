/** Client-side preview mirror of the backend's computeLineItem (money.ts). Server is authoritative. */
export const computeLineItem = (input: {
  quantity: number;
  rate: number;
  discountPercent?: number;
  gstPercent?: number;
}) => {
  const quantity = input.quantity || 0;
  const rate = input.rate || 0;
  const discountPercent = input.discountPercent || 0;
  const gstPercent = input.gstPercent || 0;

  const gross = quantity * rate;
  const discountAmount = round2(gross * (discountPercent / 100));
  const taxable = gross - discountAmount;
  const gstAmount = round2(taxable * (gstPercent / 100));
  const total = round2(taxable + gstAmount);

  return { gross: round2(gross), discountAmount, taxable: round2(taxable), gstAmount, total };
};

export const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
