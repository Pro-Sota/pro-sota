export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(value);

export const calculateBudgetUsed = (
  actualCost: number,
  approvedBudget: number
): number => {
  if (!approvedBudget) return 0;
  return Math.min((actualCost / approvedBudget) * 100, 100);
};

export const calculateExpectedMargin = (
  contractedValue: number,
  actualCost: number
): number => {
  return contractedValue - actualCost;
};

export const calculateMarginPercentage = (
  contractedValue: number,
  actualCost: number
): number => {
  const margin = calculateExpectedMargin(contractedValue, actualCost);
  return contractedValue > 0 ? (margin / contractedValue) * 100 : 0;
};

export const calculateReceivementRate = (
  received: number,
  invoiced: number
): number => {
  return invoiced > 0 ? (received / invoiced) * 100 : 0;
};