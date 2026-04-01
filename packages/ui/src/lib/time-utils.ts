const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 4 * WEEK;
const YEAR = 12 * MONTH;

export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();

  if (diff < MINUTE) {
    return "just now";
  }
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `${mins} min ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }
  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  const years = Math.floor(diff / YEAR);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}
