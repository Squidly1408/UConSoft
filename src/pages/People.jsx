import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DISCIPLINES, ROLE_LABEL } from "../data.js";
import { fmtMonth } from "../format.js";
import { useStore } from "../store.jsx";
import { Avatar, Empty, Section, Tabs } from "../components/ui.jsx";
import { Link } from "react-router-dom";

const TABS = [["student", "Students"], ["staff", "Staff"], ["company", "Industry partners"]];

export default function People() {
  const { users, projects } = useStore();
  const [params, setParams] = useSearchParams();
  const role = params.get("role") || "student";
  const [q, setQ] = useState("");
  const [disc, setDisc] = useState("All");
  const active = users.filter(u => u.status === "active");
  const needle = q.toLowerCase();
  const list = active
    .filter(u => u.role === role && (role !== "student" || disc === "All" || u.discipline === disc))
    .filter(u => !needle || [u.name, u.degree, u.title, u.industry, u.school, ...(u.skills || [])].join(" ").toLowerCase().includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="head"><div><h1>People</h1><p>Everyone on the UConSoft network.</p></div></div>
      <Tabs tabs={TABS.map(([k, l]) => [k, l, active.filter(u => u.role === k).length])} value={role} onChange={r => { setParams({ role: r }, { replace: true }); setDisc("All"); }} />
      <div className="tools">
        <input className="input" type="search" placeholder={`Search ${ROLE_LABEL[role].toLowerCase()}s`} value={q} onChange={e => setQ(e.target.value)} aria-label="Search people" />
        {role === "student" && <select value={disc} onChange={e => setDisc(e.target.value)} aria-label="Discipline"><option value="All">All disciplines</option>{DISCIPLINES.map(d => <option key={d}>{d}</option>)}</select>}
      </div>
      {list.length === 0 ? <Section><Empty icon="people">No one matches that search.</Empty></Section> : (
        <div className="people-grid">
          {list.map(u => {
            const n = projects.filter(p => p.owner === u.id && !p.hidden).length;
            const signed = projects.filter(p => p.owner === u.id && !p.hidden && p.signOff?.status === "approved").length;
            return (
              <Link key={u.id} to={`/u/${u.id}`} className="panel person">
                <Avatar u={u} size="lg" />
                <b>{u.name}</b>
                <span className="muted">{u.role === "student" ? u.degree || u.discipline : u.role === "company" ? `${u.industry} · ${u.location}` : u.title}</span>
                {u.role === "student" && <>
                  <span className="muted small">{u.year} · available {fmtMonth(u.avail)}</span>
                  <div className="chips" style={{ justifyContent: "center" }}>{(u.skills || []).slice(0, 3).map(s => <span key={s} className="chip">{s}</span>)}</div>
                  <span className="small">{n} project{n === 1 ? "" : "s"}{signed ? ` · ${signed} signed off` : ""}</span>
                </>}
                {u.role === "staff" && <span className="muted small">{u.school}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
