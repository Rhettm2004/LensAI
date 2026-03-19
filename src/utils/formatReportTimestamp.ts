/**
 * Display format for report generation time: "Generated: 19 Mar 2026, 1:38 PM"
 */
export function formatReportGeneratedAt(isoOrMs: string | number): string {
  const d = new Date(isoOrMs);
  const datePart = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `Generated: ${datePart}, ${timePart}`;
}
