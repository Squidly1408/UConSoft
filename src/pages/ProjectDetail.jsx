import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ago, fmtDate } from "../format.js";
import { useStore } from "../store.jsx";
import { DecideSignOff, ProjectForm, SignOffRequest } from "../components/forms.jsx";
import { Avatar, Empty, I, Modal, Section, Status, Thumb } from "../components/ui.jsx";

const seen = new Set();

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects, userById, me, viewProject } = useStore();
  const p = projects.find(x => x.id === id);
  const owner = p && userById[p.owner];
  const isOwner = me && p && me.id === p.owner;
  const isAdmin = me?.role === "admin";
  useEffect(() => {
    if (p && !isOwner && !seen.has(id)) { seen.add(id); viewProject(id); }
  }, [id, !!p]);

  const nav = useNavigate();
  if (!p || !owner || ((p.hidden || owner.status === "suspended") && !isOwner && !isAdmin)) {
    return <Section><Empty icon="file">This project isn't available. <Link className="link" to={me ? "/discover" : "/"}>Back</Link></Empty></Section>;
  }

  return (
    <>
      <button className="link page-back" onClick={() => nav(-1)}><I n="back" s={14} /> Back</button>
      {p.hidden && <div className="banner bad"><I n="eyeoff" s={18} /><div><b>Hidden by a moderator.</b> Only {isOwner ? "you" : "the owner"} and administrators can see this project.</div></div>}
      <div className="detail-grid">
        <div className="stack">
          <section className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <Thumb kind={p.kind} hue={owner.hue} />
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                <span className="pill">{p.type}</span>{p.course && <span className="pill">{p.course}</span>}{p.team && <span className="pill">Team project</span>}
              </div>
              <h1 style={{ fontSize: 32 }}>{p.title}</h1>
              <p className="muted" style={{ margin: "6px 0 14px" }}>Published {fmtDate(p.createdAt)}</p>
              <p style={{ fontSize: 15, lineHeight: 1.6 }}>{p.desc}</p>
              <h3 className="h3">Skills</h3>
              <div className="chips">{p.tags.map(t => <span key={t} className="chip">{t}</span>)}</div>
              <div className="links" style={{ marginTop: 18, fontSize: 13.5 }}>
                {p.links?.github && <a href={p.links.github} target="_blank" rel="noopener noreferrer"><I n="github" s={16} /> Code</a>}
                {p.links?.demo && <a href={p.links.demo} target="_blank" rel="noopener noreferrer"><I n="external" s={16} /> Demo</a>}
                {p.links?.report && <a href={p.links.report} target="_blank" rel="noopener noreferrer"><I n="doc" s={16} /> Report</a>}
              </div>
            </div>
          </section>
        </div>
        <div className="stack">
          <OwnerCard p={p} owner={owner} />
          <SignOffPanel p={p} />
          {me && <Actions p={p} />}
        </div>
      </div>
    </>
  );
}

function OwnerCard({ p, owner }) {
  const { me, toggleLike, startThread } = useStore();
  const nav = useNavigate();
  const liked = me && p.likes.includes(me.id);
  return (
    <Section>
      <Link to={`/u/${owner.id}`} className="owner">
        <Avatar u={owner} /><div><b>{owner.name}</b><small>{owner.degree || owner.discipline}</small></div>
      </Link>
      <div className="glance" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 14 }}>
        <div><b className="num">{p.views}</b><span>Views</span></div>
        <div><b className="num">{p.likes.length}</b><span>Likes</span></div>
      </div>
      <div className="form-actions" style={{ marginTop: 12 }}>
        {me && me.id !== owner.id && <button className={"btn ghost" + (liked ? " on" : "")} aria-pressed={liked} onClick={() => toggleLike(p.id)}><I n="heart" s={15} /> {liked ? "Liked" : "Like"}</button>}
        {me && me.id !== owner.id && me.status === "active" && <button className="btn" onClick={() => nav(`/messages?t=${startThread(owner.id, p.title)}`)}><I n="msg" s={15} /> Message</button>}
        {!me && <Link className="btn" to="/login">Sign in to connect</Link>}
      </div>
    </Section>
  );
}

function SignOffPanel({ p }) {
  const { me, userById, cancelSignOff, flash } = useStore();
  const [asking, setAsking] = useState(false);
  const [review, setReview] = useState(false);
  const so = p.signOff;
  const isOwner = me?.id === p.owner;
  const approver = so && userById[so.approver];
  const canDecide = so?.status === "requested" && me?.id === so.approver && me.status === "active";

  return (
    <Section title="Sign-off">
      {!so && <p className="muted" style={{ margin: 0 }}>{isOwner ? "Not signed off yet. Ask a lecturer or your WIL supervisor to verify this project." : "This project hasn't been signed off."}</p>}
      {so && (
        <>
          <div className="kv"><span>Status</span><Status s={so.status} /></div>
          <div className="kv"><span>{so.status === "requested" ? "Asked" : "Reviewer"}</span><b>{approver ? <Link className="plain-link" to={`/u/${approver.id}`}>{approver.name}</Link> : "Unknown"}</b></div>
          <div className="kv"><span>{so.status === "requested" ? "Requested" : "Decided"}</span><b>{ago(so.at)}</b></div>
          {so.note && (isOwner || canDecide || me?.role === "admin") && <blockquote className="quote">Student note: “{so.note}”</blockquote>}
          {so.comment && <blockquote className="quote">“{so.comment}”<small>— {approver?.name}</small></blockquote>}
        </>
      )}
      <div className="form-actions" style={{ marginTop: 12, justifyContent: "flex-start" }}>
        {isOwner && (!so || so.status === "changes") && <button className="btn" onClick={() => setAsking(true)}><I n="shield" s={15} /> {so ? "Request again" : "Request sign-off"}</button>}
        {isOwner && so?.status === "requested" && <button className="btn plain" onClick={() => { cancelSignOff(p.id); flash("Request cancelled"); }}>Cancel request</button>}
        {canDecide && <button className="btn" onClick={() => setReview(true)}>Review this project</button>}
      </div>
      {asking && <SignOffRequest p={p} onClose={() => setAsking(false)} />}
      {review && <DecideSignOff p={p} onClose={() => setReview(false)} />}
    </Section>
  );
}

function Actions({ p }) {
  const { me, saveProject, deleteProject, moderateProject, reportProject, flash } = useStore();
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("Not the student's own work");
  const isOwner = me?.id === p.owner, isAdmin = me?.role === "admin";
  const remove = () => { if (confirm(`Delete "${p.title}"? This can't be undone.`)) { deleteProject(p.id); flash("Project deleted"); nav(isOwner ? "/portfolio" : "/admin/content"); } };

  return (
    <Section title={isOwner ? "Manage" : isAdmin ? "Moderation" : null}>
      <div className="form-actions" style={{ justifyContent: "flex-start" }}>
        {isOwner && <button className="btn plain" onClick={() => setEditing(true)}><I n="edit" s={15} /> Edit</button>}
        {isAdmin && <button className="btn plain" onClick={() => { moderateProject(p.id, { hidden: !p.hidden }); flash(p.hidden ? "Project restored" : "Project hidden"); }}><I n={p.hidden ? "eye" : "eyeoff"} s={15} /> {p.hidden ? "Unhide" : "Hide"}</button>}
        {isAdmin && p.flagged && <button className="btn plain" onClick={() => { moderateProject(p.id, { flagged: false, flagReason: "" }); flash("Report cleared"); }}><I n="check" s={15} /> Clear report</button>}
        {(isOwner || isAdmin) && <button className="btn plain danger-text" onClick={remove}><I n="trash" s={15} /> Delete</button>}
        {!isOwner && !isAdmin && (p.flagged ? <span className="muted" style={{ fontSize: 13 }}>Reported to moderators</span>
          : <button className="link" onClick={() => setReporting(true)}><I n="flag" s={14} /> Report this project</button>)}
      </div>
      {isAdmin && p.flagged && <p className="muted" style={{ marginBottom: 0 }}>Reported: {p.flagReason || "no reason given"}</p>}
      {editing && <ProjectForm initial={p} onClose={() => setEditing(false)} onSave={n => { saveProject(n); setEditing(false); flash("Changes saved"); }} />}
      {reporting && (
        <Modal title="Report project" onClose={() => setReporting(false)}
          footer={<><button className="btn plain" onClick={() => setReporting(false)}>Cancel</button><button className="btn" onClick={() => { reportProject(p.id, reason); setReporting(false); flash("Thanks, a moderator will take a look"); }}>Send report</button></>}>
          <div className="form">
            {["Not the student's own work", "Inappropriate content", "Contains private or confidential information", "Spam or broken links"].map(r => (
              <label key={r} className="fld check"><input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} /> {r}</label>
            ))}
          </div>
        </Modal>
      )}
    </Section>
  );
}
