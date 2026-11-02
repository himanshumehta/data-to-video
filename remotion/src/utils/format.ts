export function formatINR(amount: number): string {
  if (!amount) return "0";
  const n = Math.abs(Math.round(amount));
  const s = String(n);
  if (s.length <= 3) return (amount < 0 ? "-" : "") + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const groups: string[] = [];
  for (let i = rest.length; i > 0; i -= 2) {
    groups.unshift(rest.slice(Math.max(0, i - 2), i));
  }
  return (amount < 0 ? "-" : "") + groups.join(",") + "," + last3;
}

export function formatINRShort(amount: number): string {
  if (amount >= 100000) return `\u20B9 ${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `\u20B9 ${Math.round(amount / 1000)}K`;
  return `\u20B9 ${Math.round(amount)}`;
}

export function formatINRFull(amount: number): string {
  return `\u20B9 ${formatINR(amount)}`;
}
