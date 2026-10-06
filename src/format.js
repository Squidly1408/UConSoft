const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-02" -> "Feb 2026" */
export function fmtMonth(a) {
  if (!a) return "—";
  const [y, m] = a.split("-");
  return MONTHS[+m - 1] + " " + y;
}

/** Short relative time: "just now", "5m ago", "3h ago", "Mon", "12 Mar". */
export function ago(ms) {
  const s = (Date.now() - ms) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  const dt = new Date(ms);
  if (s < 6 * 86400) return dt.toLocaleDateString("en-AU", { weekday: "short" });
  return dt.getDate() + " " + MONTHS[dt.getMonth()] + (dt.getFullYear() !== new Date().getFullYear() ? " " + dt.getFullYear() : "");
}

export const fmtDate = ms => new Date(ms).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

export const initials = n => n.replace(/^(Dr|Assoc Prof|Prof)\s+/, "").split(/\s+/).map(x => x[0]).join("").slice(0, 2).toUpperCase();

export const plural = (n, word, many = word + "s") => `${n} ${n === 1 ? word : many}`;

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
