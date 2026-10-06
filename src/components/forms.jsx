import { useState } from "react";
import {
  COMPANY_SIZES, DISCIPLINES, INDUSTRIES, INTERESTS, KINDS, OPEN_TO, PROJECT_TYPES, SCHOOLS, SKILLS, WORK_MODES, YEARS,
} from "../data.js";
import { score } from "../matching.js";
import { useStore } from "../store.jsx";
import { I, Modal, Ring, TagInput, Thumb } from "./ui.jsx";

const toggle = (arr, v) => (arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
const isUrl = v => !v || /^https?:\/\/\S+\.\S+/.test(v);

export const Err = ({ children }) => (children ? <div className="err" role="alert"><I n="info" s={15} />{children}</div> : null);

/** Role-specific profile fields (not name/email). `f` is the form state, `set` merges a patch. */
export function ProfileFields({ f, set }) {
  const links = f.links || {};
  if (f.role === "student") return (
    <>
      <div className="form-grid">
        <label className="fld span2">Degree<input className="input" value={f.degree || ""} onChange={e => set({ degree: e.target.value })} placeholder="e.g. Bachelor of Software Engineering (Honours)" /></label>
        <label className="fld">Discipline<select value={f.discipline} onChange={e => set({ discipline: e.target.value })}>{DISCIPLINES.map(d => <option key={d}>{d}</option>)}</select></label>
        <label className="fld">Year of study<select value={f.year} onChange={e => set({ year: e.target.value })}>{YEARS.map(d => <option key={d}>{d}</option>)}</select></label>
        <label className="fld">Available from<input className="input" type="month" value={f.avail || ""} onChange={e => set({ avail: e.target.value })} /></label>
        <label className="fld">GPA (out of 7, optional)<input className="input" type="number" min="1" max="7" step="0.1" value={f.gpa ?? ""} onChange={e => set({ gpa: e.target.value === "" ? null : Math.min(7, Math.max(1, +e.target.value)) })} /></label>
        <label className="fld check span2"><input type="checkbox" checked={!!f.honours} onChange={e => set({ honours: e.target.checked })} /> Honours program</label>
      </div>
      <label className="fld">About you<textarea value={f.bio || ""} onChange={e => set({ bio: e.target.value })} placeholder="What do you like building? What are you looking for?" maxLength={600} /><small className="hint">{(f.bio || "").length}/600</small></label>
      <div className="fld">Skills<TagInput value={f.skills || []} onChange={v => set({ skills: v })} suggestions={SKILLS} placeholder="Add a skill and press Enter" /></div>
      <div className="fld">Industry interests<TagInput value={f.interests || []} onChange={v => set({ interests: v })} suggestions={INTERESTS} placeholder="Add an interest and press Enter" /></div>
      <div className="fld">Open to
        <div className="chips">{OPEN_TO.map(o => <button type="button" key={o} className={"chip" + ((f.openTo || []).includes(o) ? " on" : "")} aria-pressed={(f.openTo || []).includes(o)} onClick={() => set({ openTo: toggle(f.openTo || [], o) })}>{o}</button>)}</div>
      </div>
      <div className="form-grid">
        <label className="fld">GitHub<input className="input" value={links.github || ""} onChange={e => set({ links: { ...links, github: e.target.value } })} placeholder="https://github.com/you" /></label>
        <label className="fld">LinkedIn<input className="input" value={links.linkedin || ""} onChange={e => set({ links: { ...links, linkedin: e.target.value } })} placeholder="https://linkedin.com/in/you" /></label>
        <label className="fld">Personal website<input className="input" value={links.website || ""} onChange={e => set({ links: { ...links, website: e.target.value } })} placeholder="https://" /></label>
        <label className="fld">Location<input className="input" value={f.location || ""} onChange={e => set({ location: e.target.value })} /></label>
      </div>
    </>
  );
  if (f.role === "company") return (
    <>
      <div className="form-grid">
        <label className="fld">Contact person<input className="input" value={f.contact || ""} onChange={e => set({ contact: e.target.value })} placeholder="Who should students talk to?" /></label>
        <label className="fld">Industry<select value={f.industry} onChange={e => set({ industry: e.target.value })}>{INDUSTRIES.map(d => <option key={d}>{d}</option>)}</select></label>
        <label className="fld">Company size<select value={f.size || ""} onChange={e => set({ size: e.target.value })}><option value="">Choose…</option>{COMPANY_SIZES.map(d => <option key={d}>{d}</option>)}</select></label>
        <label className="fld">Website<input className="input" value={f.website || ""} onChange={e => set({ website: e.target.value })} placeholder="https://" /></label>
        <label className="fld span2">Location<input className="input" value={f.location || ""} onChange={e => set({ location: e.target.value })} /></label>
      </div>
      <label className="fld">About the company<textarea value={f.bio || ""} onChange={e => set({ bio: e.target.value })} placeholder="What you do and what students would work on." maxLength={800} /></label>
    </>
  );
  return (
    <>
      <div className="form-grid">
        <label className="fld">Title<input className="input" value={f.title || ""} onChange={e => set({ title: e.target.value })} placeholder={f.role === "staff" ? "e.g. Lecturer, Computer Science" : "e.g. Platform Administrator"} /></label>
        {f.role === "staff"
          ? <label className="fld">School<select value={f.school} onChange={e => set({ school: e.target.value })}>{SCHOOLS.map(d => <option key={d}>{d}</option>)}</select></label>
          : <label className="fld">Location<input className="input" value={f.location || ""} onChange={e => set({ location: e.target.value })} /></label>}
      </div>
      <label className="fld">Bio<textarea value={f.bio || ""} onChange={e => set({ bio: e.target.value })} maxLength={600} /></label>
    </>
  );
}

/** Returns an error message for a profile form, or "" when it's fine. */
export function profileError(f) {
  if (!f.name?.trim()) return f.role === "company" ? "Add your company name." : "Add your name.";
  if (f.role === "student" && !f.degree?.trim()) return "Add your degree so partners know what you study.";
  if (f.role === "company" && !f.contact?.trim()) return "Add a contact person.";
  const links = [f.website, f.links?.github, f.links?.linkedin, f.links?.website];
  if (!links.every(isUrl)) return "Links need to start with http:// or https://";
  return "";
}

export function ProjectForm({ initial, onClose, onSave }) {
  const { me } = useStore();
  const [f, setF] = useState(initial || { title: "", type: "Assignment", course: "", kind: "dash", desc: "", tags: [], team: false, links: { github: "", demo: "", report: "" } });
  const [err, setErr] = useState("");
  const set = p => setF(x => ({ ...x, ...p }));
  const submit = e => {
    e.preventDefault();
    if (!f.title.trim()) return setErr("Give your project a title.");
    if (f.desc.trim().length < 20) return setErr("Describe the project in at least a sentence (20 characters or more).");
    if (!f.tags.length) return setErr("Add at least one skill tag so it shows up in matching.");
    if (!Object.values(f.links).every(isUrl)) return setErr("Links need to start with http:// or https://");
    onSave({ ...f, title: f.title.trim(), desc: f.desc.trim() });
  };
  return (
    <Modal title={initial ? "Edit project" : "Add a project"} onClose={onClose} wide
      footer={<><button type="button" className="btn plain" onClick={onClose}>Cancel</button><button className="btn" form="project-form">{initial ? "Save changes" : "Publish project"}</button></>}>
      <form id="project-form" onSubmit={submit} className="form">
        <label className="fld">Title<input className="input" value={f.title} onChange={e => set({ title: e.target.value })} placeholder="e.g. Smart Car Counter" autoFocus /></label>
        <div className="form-grid">
          <label className="fld">Type<select value={f.type} onChange={e => set({ type: e.target.value })}>{PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
          <label className="fld">Course code (optional)<input className="input" value={f.course} onChange={e => set({ course: e.target.value.toUpperCase() })} placeholder="e.g. SENG2260" /></label>
        </div>
        <label className="fld">Description<textarea value={f.desc} onChange={e => set({ desc: e.target.value })} placeholder="What did you build, how, and what was the outcome?" maxLength={600} /></label>
        <div className="fld">Skills used<TagInput value={f.tags} onChange={v => set({ tags: v })} suggestions={SKILLS} /></div>
        <div className="fld">Cover image
          <div className="kinds">
            {KINDS.map(([k, l]) => (
              <button type="button" key={k} className={"kind" + (f.kind === k ? " on" : "")} aria-pressed={f.kind === k} onClick={() => set({ kind: k })}>
                <Thumb kind={k} hue={me?.hue ?? 205} /><span>{l}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="form-grid three">
          <label className="fld">Code link<input className="input" value={f.links.github} onChange={e => set({ links: { ...f.links, github: e.target.value } })} placeholder="https://github.com/…" /></label>
          <label className="fld">Demo link<input className="input" value={f.links.demo} onChange={e => set({ links: { ...f.links, demo: e.target.value } })} placeholder="https://" /></label>
          <label className="fld">Report link<input className="input" value={f.links.report} onChange={e => set({ links: { ...f.links, report: e.target.value } })} placeholder="https://" /></label>
        </div>
        <label className="fld check"><input type="checkbox" checked={f.team} onChange={e => set({ team: e.target.checked })} /> This was a team project</label>
        <Err>{err}</Err>
      </form>
    </Modal>
  );
}

export function OppForm({ initial, onClose, onSave }) {
  const [f, setF] = useState(initial || { title: "", desc: "", period: "Feb – Nov 2026", start: "2026-02", mode: "Hybrid", location: "Newcastle NSW", paid: true, skills: [], disciplines: [], themes: [] });
  const [err, setErr] = useState("");
  const set = p => setF(x => ({ ...x, ...p }));
  const submit = e => {
    e.preventDefault();
    if (!f.title.trim()) return setErr("Add a title so students know what the role is.");
    if (f.skills.length < 2) return setErr("Add at least two skills so matching has something to work with.");
    if (!f.disciplines.length) return setErr("Pick at least one discipline.");
    onSave({ ...f, title: f.title.trim(), themes: f.themes.length ? f.themes : ["Sustainability"] });
  };
  return (
    <Modal title={initial ? "Edit opportunity" : "Create WIL opportunity"} onClose={onClose} wide
      footer={<><button type="button" className="btn plain" onClick={onClose}>Cancel</button><button className="btn" form="opp-form">{initial ? "Save changes" : "Post opportunity"}</button></>}>
      <form id="opp-form" onSubmit={submit} className="form">
        <label className="fld">Title<input className="input" value={f.title} onChange={e => set({ title: e.target.value })} placeholder="e.g. Cloud Platform Intern" autoFocus /></label>
        <label className="fld">Description<textarea value={f.desc} onChange={e => set({ desc: e.target.value })} placeholder="What will the student work on?" /></label>
        <div className="form-grid">
          <label className="fld">Period<input className="input" value={f.period} onChange={e => set({ period: e.target.value })} /></label>
          <label className="fld">Start month<input className="input" type="month" value={f.start} onChange={e => set({ start: e.target.value })} /></label>
          <label className="fld">Work mode<select value={f.mode} onChange={e => set({ mode: e.target.value })}>{WORK_MODES.map(m => <option key={m}>{m}</option>)}</select></label>
          <label className="fld">Location<input className="input" value={f.location} onChange={e => set({ location: e.target.value })} /></label>
          <label className="fld check span2"><input type="checkbox" checked={f.paid} onChange={e => set({ paid: e.target.checked })} /> Paid placement</label>
        </div>
        <div className="fld">Required skills<TagInput value={f.skills} onChange={v => set({ skills: v })} suggestions={SKILLS} /></div>
        <div className="fld">Preferred disciplines
          <div className="chips">{DISCIPLINES.map(d => <button type="button" key={d} className={"chip" + (f.disciplines.includes(d) ? " on" : "")} aria-pressed={f.disciplines.includes(d)} onClick={() => set({ disciplines: toggle(f.disciplines, d) })}>{d}</button>)}</div>
        </div>
        <div className="fld">Themes students might care about<TagInput value={f.themes} onChange={v => set({ themes: v })} suggestions={INTERESTS} /></div>
        <Err>{err}</Err>
      </form>
    </Modal>
  );
}

export function SignOffRequest({ p, onClose }) {
  const { users, requestSignOff, flash } = useStore();
  const staff = users.filter(u => u.role === "staff" && u.status === "active");
  const companies = users.filter(u => u.role === "company" && u.status === "active");
  const [approver, setApprover] = useState(staff[0]?.id || "");
  const [note, setNote] = useState("");
  const submit = e => {
    e.preventDefault();
    requestSignOff(p.id, approver, note.trim());
    flash("Sign-off requested");
    onClose();
  };
  return (
    <Modal title="Request sign-off" onClose={onClose}
      footer={<><button type="button" className="btn plain" onClick={onClose}>Cancel</button><button className="btn" form="so-form" disabled={!approver}>Send request</button></>}>
      <form id="so-form" onSubmit={submit} className="form">
        <p className="muted" style={{ margin: 0 }}>A sign-off confirms that <b>{p.title}</b> is your work. Signed-off projects get a verified badge and count for more in matching.</p>
        <label className="fld">Who should sign it off?
          <select value={approver} onChange={e => setApprover(e.target.value)}>
            <optgroup label="University staff">{staff.map(u => <option key={u.id} value={u.id}>{u.name} — {u.title}</option>)}</optgroup>
            <optgroup label="Industry partners (for WIL projects)">{companies.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</optgroup>
          </select>
        </label>
        <label className="fld">Note (optional)<textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Course, team members, anything that helps them check it." /></label>
      </form>
    </Modal>
  );
}

export function DecideSignOff({ p, onClose }) {
  const { decideSignOff, flash, userById } = useStore();
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const decide = status => {
    if (status === "changes" && !comment.trim()) return setErr("Tell the student what to change.");
    decideSignOff(p.id, status, comment.trim());
    flash(status === "approved" ? `Signed off ${p.title}` : "Changes requested");
    onClose();
  };
  return (
    <Modal title={`Review: ${p.title}`} onClose={onClose}
      footer={<><button type="button" className="btn plain" onClick={() => decide("changes")}>Request changes</button><button type="button" className="btn" onClick={() => decide("approved")}><I n="check" s={15} w={2.2} /> Sign off</button></>}>
      <div className="form">
        <p style={{ margin: 0 }}><b>{userById[p.owner]?.name}</b> · {p.type}{p.course ? ` · ${p.course}` : ""}</p>
        <p className="muted" style={{ margin: 0 }}>{p.desc}</p>
        {p.signOff?.note && <blockquote className="quote">“{p.signOff.note}”</blockquote>}
        <label className="fld">Comment for the student<textarea value={comment} onChange={e => { setComment(e.target.value); setErr(""); }} placeholder="Optional when signing off, required when asking for changes." /></label>
        <Err>{err}</Err>
      </div>
    </Modal>
  );
}

export function ApplyModal({ opp, onClose }) {
  const { me, projects, apply, flash, userById } = useStore();
  const m = score(me, opp, projects);
  const [cover, setCover] = useState("");
  const submit = e => {
    e.preventDefault();
    apply(opp.id, cover.trim());
    flash(`Applied for ${opp.title}`);
    onClose();
  };
  return (
    <Modal title={`Apply: ${opp.title}`} onClose={onClose}
      footer={<><button type="button" className="btn plain" onClick={onClose}>Cancel</button><button className="btn" form="apply-form"><I n="send" s={15} /> Submit application</button></>}>
      <form id="apply-form" onSubmit={submit} className="form">
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Ring v={m.total} />
          <div><b>{userById[opp.company]?.name}</b><div className="muted">{opp.period} · {opp.mode}</div>
            {m.missing.length > 0 && <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>Skills you haven't listed: {m.missing.join(", ")}</div>}</div>
        </div>
        <p className="muted" style={{ margin: 0 }}>Your profile and portfolio are shared with the company when you apply.</p>
        <label className="fld">Why are you interested? (optional)<textarea value={cover} onChange={e => setCover(e.target.value)} maxLength={800} placeholder="A few sentences about why this role suits you." /></label>
      </form>
    </Modal>
  );
}
