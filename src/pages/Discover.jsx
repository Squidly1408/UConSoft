import { useState } from "react";
import { PROJECT_TYPES } from "../data.js";
import { useVisibleProjects } from "../hooks.js";
import { useStore } from "../store.jsx";
import { Empty, Section, WorkCard } from "../components/ui.jsx";

const SORTS = { newest: (a, b) => b.createdAt - a.createdAt, views: (a, b) => b.views - a.views, likes: (a, b) => b.likes.length - a.likes.length };

export default function Discover() {
  const { userById } = useStore();
  const all = useVisibleProjects();
  const [tag, setTag] = useState("All");
  const [type, setType] = useState("All");
  const [q, setQ] = useState("");
  const [verified, setVerified] = useState(false);
  const [sort, setSort] = useState("newest");

  const counts = {};
  all.forEach(p => p.tags.forEach(t => (counts[t] = (counts[t] || 0) + 1)));
  const tags = ["All", ...Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 18)];
  const needle = q.toLowerCase();
  const list = all
    .filter(p => (tag === "All" || p.tags.includes(tag)) && (type === "All" || p.type === type) && (!verified || p.signOff?.status === "approved"))
    .filter(p => !needle || [p.title, p.desc, p.course, userById[p.owner]?.name, ...p.tags].join(" ").toLowerCase().includes(needle))
    .sort(SORTS[sort]);

  return (
    <>
      <div className="head"><div><h1>Student Work</h1><p>Projects students have published to the WIL network.</p></div></div>
      <div className="tools">
        <input className="input" type="search" placeholder="Search projects, people, course codes" value={q} onChange={e => setQ(e.target.value)} aria-label="Search projects" />
        <select value={type} onChange={e => setType(e.target.value)} aria-label="Project type"><option value="All">All types</option>{PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}</select>
        <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort"><option value="newest">Newest</option><option value="views">Most viewed</option><option value="likes">Most liked</option></select>
        <label className="fld inline"><input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} /> Signed off only</label>
      </div>
      <div className="chips" style={{ marginBottom: 16 }}>
        {tags.map(t => <button key={t} className={"chip" + (tag === t ? " on" : "")} aria-pressed={tag === t} onClick={() => setTag(t)}>{t}</button>)}
      </div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>{list.length} project{list.length === 1 ? "" : "s"}</div>
      {list.length ? <div className="works">{list.map(p => <WorkCard key={p.id} p={p} />)}</div>
        : <Section><Empty icon="search">No projects match. Try another tag or clear the search.</Empty></Section>}
    </>
  );
}
