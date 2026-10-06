import { useMemo } from "react";
import { score } from "./matching.js";
import { useStore } from "./store.jsx";

/** Active student accounts. */
export function useStudents() {
  const { users } = useStore();
  return useMemo(() => users.filter(u => u.role === "student" && u.status === "active"), [users]);
}

/** Projects the current viewer may see: hidden ones only show to their owner and admins. */
export function useVisibleProjects() {
  const { projects, me, userById } = useStore();
  return useMemo(
    () => projects.filter(p => userById[p.owner]?.status !== "suspended" && (!p.hidden || me?.role === "admin" || me?.id === p.owner)),
    [projects, me, userById]
  );
}

/** Students ranked by match score for an opportunity. */
export function useRanked(opp) {
  const students = useStudents();
  const { projects } = useStore();
  return useMemo(
    () => (opp ? students.map(st => ({ st, m: score(st, opp, projects) })).sort((a, b) => b.m.total - a.m.total) : []),
    [students, projects, opp]
  );
}

/** The signed-in company's opportunities and the one currently picked for matching. */
export function useCompanyOpps() {
  const { opps, oppId, me } = useStore();
  return useMemo(() => {
    const mine = opps.filter(o => o.company === me?.id);
    const open = mine.filter(o => o.status === "Open");
    return { mine, open, opp: mine.find(o => o.id === oppId) || open[0] || mine[0] || null };
  }, [opps, oppId, me]);
}

/** Open opportunities from active companies, each with its company record. */
export function useOpenOpps() {
  const { opps, userById } = useStore();
  return useMemo(
    () => opps.filter(o => o.status === "Open" && userById[o.company]?.status === "active").map(o => ({ ...o, co: userById[o.company] })),
    [opps, userById]
  );
}
