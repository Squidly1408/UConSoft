import { APP_STATUSES, STAGES } from "../data.js";
import { useCompanyOpps, useRanked } from "../hooks.js";
import { useStore } from "../store.jsx";
import { Bars, Empty, OppPicker, Section, Talent } from "../components/ui.jsx";

export default function Reports() {
  const { me, shortlists, applications } = useStore();
  const { mine, open, opp } = useCompanyOpps();
  const ranked = useRanked(opp);
  if (!opp) return <><div className="head"><div><h1>Reports</h1></div></div><Section><Empty icon="chart">Reports appear once you've posted an opportunity.</Empty></Section></>;

  const pipeline = shortlists[me.id] || {};
  const myIds = new Set(mine.map(o => o.id));
  const apps = applications.filter(a => myIds.has(a.opp) && a.status !== "Withdrawn");
  const bands = [["90 and above", r => r.m.total >= 90], ["80–89", r => r.m.total >= 80 && r.m.total < 90], ["70–79", r => r.m.total >= 70 && r.m.total < 80], ["Below 70", r => r.m.total < 70]];
  const avg = k => (ranked.length ? Math.round(ranked.reduce((s, r) => s + r.m.b[k], 0) / ranked.length) : 0);
  const stageCounts = STAGES.map(s => [s, Object.values(pipeline).filter(x => x === s).length]);
  const appCounts = APP_STATUSES.map(s => [s, apps.filter(a => a.status === s).length]);

  return (
    <>
      <div className="head"><div><h1>Reports</h1><p>Talent pipeline for {opp.title}</p></div><OppPicker opps={open.length ? open : mine} /></div>
      <div className="stats">
        {[["Average match", ranked.length ? Math.round(ranked.reduce((s, r) => s + r.m.total, 0) / ranked.length) + "%" : "—"], ["Applications", apps.length], ["In pipeline", Object.keys(pipeline).length], ["Open roles", open.length]].map(([l, v]) => (
          <div className="panel" key={l}><div className="muted" style={{ fontSize: 13 }}>{l}</div><div className="big num">{v}</div></div>
        ))}
      </div>
      <div className="grid2">
        <Section title="Score distribution">
          <Bars rows={bands.map(([l, f]) => [l, ranked.filter(f).length])} max={Math.max(1, ranked.length)} />
          <hr className="sep" />
          <div className="panel-h"><h2>Average by factor</h2></div>
          <Bars rows={[["Skills", avg("skills")], ["Projects", avg("project")], ["Course", avg("course")], ["Availability", avg("availability")], ["Interests", avg("interests")]]} />
        </Section>
        <div className="stack">
          <Section title="Applications by status"><Bars rows={appCounts} max={Math.max(1, ...appCounts.map(s => s[1]))} /></Section>
          <Section title="Shortlist by stage"><Bars rows={stageCounts} max={Math.max(1, ...stageCounts.map(s => s[1]))} /></Section>
          <Talent />
        </div>
      </div>
    </>
  );
}
