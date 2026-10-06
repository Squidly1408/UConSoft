import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ago } from "../format.js";
import { useStore } from "../store.jsx";
import { ProjectForm, SignOffRequest } from "../components/forms.jsx";
import { Completeness, Empty, I, Section, Status, Thumb } from "../components/ui.jsx";

export default function Portfolio() {
  const { me, projects, saveProject, deleteProject, flash } = useStore();
  const [editing, setEditing] = useState(null); // null | "new" | project
  const [asking, setAsking] = useState(null);
  const nav = useNavigate();
  const mine = projects.filter(p => p.owner === me.id).sort((a, b) => b.createdAt - a.createdAt);
  const totals = [
    ["Projects", mine.length], ["Signed off", mine.filter(p => p.signOff?.status === "approved").length],
    ["Views", mine.reduce((s, p) => s + p.views, 0)], ["Likes", mine.reduce((s, p) => s + p.likes.length, 0)],
  ];

  return (
    <>
      <div className="head">
        <div><h1>My Portfolio</h1><p>Publish your work and get it signed off so partners can trust it.</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="btn lg plain" to={`/u/${me.id}`}><I n="eye" s={16} /> Public view</Link>
          <button className="btn lg" onClick={() => setEditing("new")}><I n="plus" s={18} w={2.2} /> Add project</button>
        </div>
      </div>
      <div className="stats">{totals.map(([l, v]) => <div className="panel" key={l}><div className="muted" style={{ fontSize: 13 }}>{l}</div><div className="big num">{v}</div></div>)}</div>
      <div className="grid2">
        <Section title="Projects">
          {mine.length === 0 && <Empty icon="file" action={<button className="btn" onClick={() => setEditing("new")}>Add your first project</button>}>
            Your portfolio is empty. Add an assignment, capstone or side project to start showing up in matches.</Empty>}
          {mine.map(p => (
            <div key={p.id} className="prow">
              <Link to={`/work/${p.id}`} className="prow-thumb" aria-label={p.title}><Thumb kind={p.kind} hue={me.hue} /></Link>
              <div style={{ minWidth: 0 }}>
                <Link to={`/work/${p.id}`} className="plain-link"><b>{p.title}</b></Link>
                <div className="meta">{p.type}{p.course ? ` · ${p.course}` : ""} · {ago(p.createdAt)} · <I n="eye" s={12} /> {p.views} · <I n="heart" s={12} /> {p.likes.length}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {p.signOff ? <Status s={p.signOff.status} /> : <span className="pill">Not signed off</span>}
                  {p.hidden && <span className="pill bad">Hidden by moderator</span>}
                </div>
                {p.signOff?.status === "changes" && p.signOff.comment && <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>Feedback: “{p.signOff.comment}”</div>}
              </div>
              <div className="prow-acts">
                {(!p.signOff || p.signOff.status === "changes") && <button className="btn" onClick={() => setAsking(p)}><I n="shield" s={15} /> {p.signOff ? "Request again" : "Request sign-off"}</button>}
                <button className="btn plain icon" aria-label={`Edit ${p.title}`} title="Edit" onClick={() => setEditing(p)}><I n="edit" s={16} /></button>
                <button className="btn plain icon" aria-label={`Delete ${p.title}`} title="Delete" onClick={() => { if (confirm(`Delete "${p.title}"?`)) { deleteProject(p.id); flash("Project deleted"); } }}><I n="trash" s={16} /></button>
              </div>
            </div>
          ))}
        </Section>
        <div className="stack">
          <Completeness u={me} />
          <Section title="How sign-offs work">
            <ol className="howto">
              <li>Publish a project with a clear description and skill tags.</li>
              <li>Ask the lecturer who marked it, or your WIL supervisor, to sign it off.</li>
              <li>Once approved, it gets a verified badge and counts for more in matching.</li>
            </ol>
          </Section>
        </div>
      </div>
      {editing && <ProjectForm initial={editing === "new" ? null : editing} onClose={() => setEditing(null)}
        onSave={p => { const id = saveProject(p); const isNew = editing === "new"; setEditing(null); flash(isNew ? "Project published" : "Changes saved"); if (isNew) nav(`/work/${id}`); }} />}
      {asking && <SignOffRequest p={asking} onClose={() => setAsking(null)} />}
    </>
  );
}
