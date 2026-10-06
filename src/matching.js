import { fmtMonth } from "./format.js";

const overlap = (a, b) => a.filter(x => b.includes(x));
const clamp = v => Math.max(0, Math.min(100, Math.round(v)));

// Weights for the overall score. Tune these to change how students are ranked.
export const WEIGHTS = { skills: 0.35, project: 0.25, course: 0.15, availability: 0.1, interests: 0.15 };

export const LABELS = {
  skills: "Skills match",
  project: "Project relevance",
  course: "Course alignment",
  availability: "Availability",
  interests: "Industry interests",
};

/**
 * Score one student against one opportunity using the student's visible projects.
 * Returns total (0–100), per-factor breakdown and human-readable reasons.
 */
export function score(st, opp, projects) {
  const own = projects.filter(p => p.owner === st.id && !p.hidden);
  const projectTags = own.flatMap(p => p.tags);
  const skills = st.skills || [], interests = st.interests || [];
  const ms = overlap(opp.skills, skills);
  const mp = overlap(opp.skills, projectTags);
  const mi = overlap(opp.themes, interests);

  const course =
    (st.discipline === opp.disciplines[0] ? 90 : opp.disciplines.includes(st.discipline) ? 85 : 70) +
    (st.honours ? 4 : 0) + ((st.gpa || 5.5) - 5.5) * 4;

  const b = {
    skills: clamp(58 + (42 * ms.length) / Math.max(4, opp.skills.length)),
    project: clamp(60 + (40 * mp.length) / Math.max(1, Math.min(4, opp.skills.length))),
    course: clamp(course),
    availability: !st.avail || st.avail <= opp.start ? 100 : 78,
    interests: clamp(68 + (32 * mi.length) / Math.max(1, Math.min(2, opp.themes.length))),
  };
  const total = clamp(Object.entries(WEIGHTS).reduce((s, [k, w]) => s + w * b[k], 0));

  const reasons = [];
  const best = [...own].sort((a, b) => overlap(opp.skills, b.tags).length - overlap(opp.skills, a.tags).length)[0];
  if (best) reasons.push(["doc", `Built ${best.title.replace(/ –.*/, "")} (${best.tags.slice(0, 2).join(", ")})`]);
  const verified = own.filter(p => p.signOff?.status === "approved").length;
  if (verified) reasons.push(["check", `${verified} project${verified > 1 ? "s" : ""} signed off by staff or industry`]);
  if (own.some(p => p.team)) reasons.push(["team", "Completed a team engineering project"]);
  if (ms.length) reasons.push(["code", `Evidence for ${ms.slice(0, 3).join(", ")} across coursework and projects`]);
  if (mi.length) reasons.push(["star", `Expressed interest in ${mi.slice(0, 2).join(" and ").toLowerCase()}`]);
  if (st.avail && st.avail > opp.start) reasons.push(["info", `Available from ${fmtMonth(st.avail)}, after the planned start`]);

  return { total, b, matched: ms, missing: opp.skills.filter(s => !skills.includes(s)), more: Math.max(0, ms.length - 3), reasons };
}

export const band = t => (t >= 80 ? "Strong match" : t >= 70 ? "Good match" : "Partial match");
