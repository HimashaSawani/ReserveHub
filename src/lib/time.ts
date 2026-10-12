const OFFSET_MINUTES = 330;

export function parseColomboDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}:00+05:30`);
  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  // Reject invalid dates that JavaScript might otherwise normalize.
  const roundTrip = new Date(
    date.getTime() + OFFSET_MINUTES * 60_000,
  )
    .toISOString()
    .slice(0, 16);

  return roundTrip === value ? date : null;
}

export function colomboToday(): string {
  return new Date(Date.now() + OFFSET_MINUTES * 60_000)
    .toISOString()
    .slice(0, 10);
}

export function formatColombo(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatColomboTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
