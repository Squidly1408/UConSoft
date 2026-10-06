import { useState } from "react";
import { Link } from "react-router-dom";
import { DISCIPLINES } from "../data.js";
import { useCompanyOpps, useRanked } from "../hooks.js";
import { Breakdown, Empty, MatchRow, OppPicker, Section } from "../components/ui.jsx";

export default function FindStudents() {
  const { mine, open, opp } = useCompanyOpps();
  const ranked = useRanked(opp);
  const [q, setQ] = useState("");
  const [disc, setDisc] = useState("All");
  const [minScore, setMinScore] = useState(0);
  const [availOnly, setAvailOnly] = useState(false);
  const [sel, setSel] = useState(null);

  if (!opp) return (
    <>
      <div className="head"><div><h1>Find Students</h1></div></div>
      <Section><Empty icon="brief" action={<Link className="btn" to="/opportunities">Go to opportunities</Link>}>Create an opportunity first. Students are ranked against the skills and themes it asks for.</Empty></Section>
    </>
  );

  const needle = q.toLowerCase();
  const rows = ranked.filter(r =>
    (disc === "All" || r.st.discipline === disc) &&
    r.m.total >= minScore &&
    (!availOnly || r.m.b.availability === 100) &&
    (!needle || [r.st.name, r.st.degree, ...r.st.skills].join(" ").toLowerCase().includes(needle))
  );
  const selected = rows.find(r => r.st.id === sel) || rows[0];

  return (
    <>
      <div className="head"><div><h1>Find Students</h1><p>Ranked by match score for the opportunity you choose.</p></div></div>
      <div className="grid2">
        <section className="panel">
          <div className="tools">
            <input className="input" type="search" placeholder="Search by name, skill or degree" value={q} onChange={e => setQ(e.target.value)} aria-label="Search students" />
            <select value={disc} onChange={e => setDisc(e.target.value)} aria-label="Discipline">
              <option value="All">All disciplines</option>{DISCIPLINES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="tools">
            <OppPicker opps={open.length ? open : mine} />
            <label className="fld inline">Min score <input type="range" min="0" max="95" step="5" value={minScore} onChange={e => setMinScore(+e.target.value)} /><b className="num">{minScore}%</b></label>
            <label className="fld inline"><input type="checkbox" checked={availOnly} onChange={e => setAvailOnly(e.target.checked)} /> Available by start date</label>
          </div>
          <div className="muted" style={{ fontSize: 13, margin: "4px 0 6px" }}>{rows.length} students</div>
          {rows.length
            ? rows.map((r, i) => <MatchRow key={r.st.id} st={r.st} m={r.m} rank={i + 1} selected={r.st.id === selected?.st.id} onSelect={() => setSel(r.st.id)} />)
            : <Empty icon="search">No students match these filters. Lower the minimum score or clear the search.</Empty>}
        </section>
        {selected && <Breakdown st={selected.st} m={selected.m} />}
      </div>
    </>
  );
}
