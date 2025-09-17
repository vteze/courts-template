export function parseLocalDate(dateString: string): Date {
  if (!dateString) {
    return new Date(NaN);
  }

  const parts = dateString.split('-');
  if (parts.length < 3) {
    return new Date(dateString);
  }

  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return new Date(dateString);
  }

  return new Date(year, month - 1, day);
}
