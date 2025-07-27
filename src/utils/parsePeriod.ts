export function parsePeriodToDate(period: string = "7d") {
  const days = parseInt(period.replace("d", ""));
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
