import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ROLE_LABEL, STAGES } from "../data.js";
import { fmtDate, fmtMonth } from "../format.js";
import { LABELS, score } from "../matching.js";
import { useCompanyOpps, useOpenOpps, useVisibleProjects } from "../hooks.js";
import { useStore } from "../store.jsx";
import { Avatar, Bars, Empty, I, OppPicker, Ring, RolePill, Section, Status, WorkCard } from "../components/ui.jsx";

const seen = new Set(); // one view per viewer per profile per page load

export default function Profile() {
  const { id } = useParams();
  const { userById, me, viewProfile } = useStore();
  const u = userById[id];
  useEffect(() => {
    const k = (me?.id || "anon") + ":" + id;
    if (u && !seen.has(k)) { seen.add(k); viewProfile(id); }
  }, [id, !!u]);

  const isSelf = me?.id === id;
  const canSee = u && (u.status === "active" || isSelf || me?.role === "admin");
  if (!canSee) return <Section><Empty icon="user">This profile isn't available. <Link to="/" className="link">Go home</Link></Empty></Section>;

  return (
    <>
      <Header u={u} />
      {u.role === "student" ? <StudentBody u={u} /> : u.role === "company" ? <CompanyBody u={u} /> : u.role === "staff" ? <StaffBody u={u} /> : (
        <Section title="About"><p style={{ margin: 0 }}>{u.bio || "No bio yet."}</p></Section>
      )}
    </>
  );
}

function Header({ u }) {
  const { me, shortlists, toggleShort, startThread } = useStore();
  const nav = useNavigate();
  const isSelf = me?.id === u.id;
  const short = me?.role === "company" && !!shortlists[me.id]?.[u.id];
  const canMessage = me && !isSelf && me.status === "active" && u.status === "active";
  const message = () => nav(`/messages?t=${startThread(u.id)}`);
  const links = u.role === "student" ? u.links || {} : { website: u.website };
  const sub = u.role === "student" ? [u.degree, u.year, u.location].filter(Boolean)
    : u.role === "company" ? [u.industry, u.size && `${u.size} people`, u.location].filter(Boolean)
    : [u.title, u.school].filter(Boolean);

  return (
    <div className="profile-head panel">
      <div className="ph-main">
        <Avatar u={u} size="xl" />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><h1>{u.name}</h1><RolePill role={u.role} />{u.status !== "active" && <Status s={u.status} />}</div>
          <p className="muted" style={{ margin: "4px 0 8px" }}>{sub.join(" · ")}</p>
          {u.role === "student" && (
            <div className="facts">
              <span><I n="clock" s={15} /> Available {fmtMonth(u.avail)}</span>
              {u.gpa && me && me.role !== "student" && <span><I n="star" s={15} /> GPA {Number(u.gpa).toFixed(1)} / 7</span>}
              {u.honours && <span><I n="shield" s={15} /> Honours</span>}
            </div>
          )}
          <div className="facts">
            {links.github && <a href={links.github} target="_blank" rel="noopener noreferrer"><I n="github" s={15} /> GitHub</a>}
            {links.linkedin && <a href={links.linkedin} target="_blank" rel="noopener noreferrer"><I n="linkedin" s={15} /> LinkedIn</a>}
            {links.website && <a href={links.website} target="_blank" rel="noopener noreferrer"><I n="external" s={15} /> Website</a>}
            {u.role === "company" && u.contact && <span><I n="user" s={15} /> Contact: {u.contact}</span>}
          </div>
          {u.role === "student" && u.openTo?.length > 0 && <div className="chips">{u.openTo.map(o => <span key={o} className="chip ok">Open to {o.toLowerCase()}</span>)}</div>}
        </div>
      </div>
      <div className="ph-acts">
        {isSelf && <Link className="btn" to="/settings"><I n="edit" s={15} /> Edit profile</Link>}
        {isSelf && u.role === "student" && <Link className="btn plain" to="/portfolio"><I n="plus" s={15} /> Add project</Link>}
        {me?.role === "company" && u.role === "student" && (
          <button className={"btn ghost" + (short ? " on" : "")} onClick={() => toggleShort(u.id)} aria-pressed={short}><I n="bookmark" s={15} /> {short ? "Shortlisted" : "Shortlist"}</button>
        )}
        {canMessage && <button className="btn" onClick={message}><I n="msg" s={15} /> Message</button>}
        {me?.role === "admin" && !isSelf && <Link className="btn plain" to={`/admin/users?edit=${u.id}`}><I n="settings" s={15} /> Manage account</Link>}
        {!me && <Link className="btn" to="/login">Sign in to connect</Link>}
      </div>
    </div>
  );
}

function StudentBody({ u }) {
  const { me, projects, notes, shortlists, setNote, setStage, flash } = useStore();
  const visible = useVisibleProjects();
  const work = (me?.id === u.id ? projects : visible).filter(p => p.owner === u.id).sort((a, b) => b.createdAt - a.createdAt);
  const isCompany = me?.role === "company";
  const { mine, open, opp } = useCompanyOpps();
  const m = isCompany && opp ? score(u, opp, projects) : null;
  const stage = isCompany && shortlists[me.id]?.[u.id];
  const signed = work.filter(p => p.signOff?.status === "approved").length;

  return (
    <>
      <div className="profile-grid">
        <div className="stack">
          <Section title="About">
            <p style={{ marginTop: 0 }}>{u.bio || <span className="muted">No bio yet.</span>}</p>
            <h3 className="h3">Skills</h3>
            <div className="chips">{(u.skills || []).map(s => <span key={s} className={"chip" + (opp?.skills.includes(s) && isCompany ? " ok" : "")}>{s}</span>)}{!u.skills?.length && <span className="muted">None listed</span>}</div>
            <h3 className="h3">Interests</h3>
            <div className="chips">{(u.interests || []).map(s => <span key={s} className="chip">{s}</span>)}{!u.interests?.length && <span className="muted">None listed</span>}</div>
          </Section>
          {isCompany && (
            <Section title="Your private notes" action={stage && (
              <select aria-label="Pipeline stage" value={stage} onChange={e => { setStage(u.id, e.target.value); flash(`Moved to ${e.target.value}`); }}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>)}>
              <textarea value={notes[me.id]?.[u.id] || ""} onChange={e => setNote(u.id, e.target.value)} placeholder="Interview notes, availability, follow-ups. Only your company can see these. Saved automatically." />
            </Section>
          )}
        </div>
        <div className="stack">
          {m ? (
            <Section title="Match" action={<OppPicker opps={open.length ? open : mine} />}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <Ring v={m.total} /><div><b>{opp.title}</b><div className="muted" style={{ fontSize: 13 }}>{opp.period}</div></div>
              </div>
              <Bars rows={Object.keys(LABELS).map(k => [LABELS[k], m.b[k]])} />
              <hr className="sep" />
              <ul className="reasons">{m.reasons.map(([ic, t]) => <li key={t}><I n={ic} s={18} /><span>{t}</span></li>)}</ul>
              {mine.length > 1 && <>
                <hr className="sep" />
                <h3 className="h3" style={{ marginTop: 0 }}>Across your roles</h3>
                {mine.map(o => <div key={o.id} className="kv"><Link to={`/opportunities/${o.id}`} className="plain-link">{o.title}</Link><b className="num">{score(u, o, projects).total}%</b></div>)}
              </>}
            </Section>
          ) : (
            <Section title="At a glance">
              <div className="glance">
                <div><b className="num">{work.length}</b><span>Projects</span></div>
                <div><b className="num">{signed}</b><span>Signed off</span></div>
                <div><b className="num">{u.views || 0}</b><span>Profile views</span></div>
                <div><b className="num">{work.reduce((s, p) => s + p.likes.length, 0)}</b><span>Likes</span></div>
              </div>
              <div className="kv"><span>Discipline</span><b>{u.discipline}</b></div>
              <div className="kv"><span>Member since</span><b>{fmtDate(u.createdAt)}</b></div>
            </Section>
          )}
        </div>
      </div>
      <h2 className="section-title">Projects</h2>
      {work.length ? <div className="works">{work.map(p => <WorkCard key={p.id} p={p} />)}</div>
        : <Section><Empty icon="file" action={me?.id === u.id && <Link className="btn" to="/portfolio">Add your first project</Link>}>No projects published yet.</Empty></Section>}
    </>
  );
}

function CompanyBody({ u }) {
  const openOpps = useOpenOpps().filter(o => o.company === u.id);
  return (
    <div className="profile-grid">
      <Section title={`About ${u.name}`}>
        <p style={{ marginTop: 0 }}>{u.bio || <span className="muted">No description yet.</span>}</p>
        <div className="kv"><span>Industry</span><b>{u.industry}</b></div>
        {u.size && <div className="kv"><span>Size</span><b>{u.size} people</b></div>}
        <div className="kv"><span>Location</span><b>{u.location}</b></div>
        {u.contact && <div className="kv"><span>Contact</span><b>{u.contact}</b></div>}
        <div className="kv"><span>Partner since</span><b>{fmtDate(u.createdAt)}</b></div>
      </Section>
      <Section title="Open opportunities">
        {openOpps.length === 0 && <p className="muted" style={{ margin: 0 }}>No open roles right now.</p>}
        {openOpps.map(o => (
          <Link key={o.id} to={`/opportunities/${o.id}`} className="line"><span><b>{o.title}</b><small>{o.period} · {o.mode} · {o.location}</small></span><I n="chev" s={16} /></Link>
        ))}
      </Section>
    </div>
  );
}

function StaffBody({ u }) {
  const { projects, userById } = useStore();
  const signed = projects.filter(p => p.signOff?.approver === u.id && p.signOff.status === "approved" && !p.hidden);
  return (
    <div className="profile-grid">
      <Section title="About">
        <p style={{ marginTop: 0 }}>{u.bio || <span className="muted">No bio yet.</span>}</p>
        <div className="kv"><span>School</span><b>{u.school}</b></div>
        <div className="kv"><span>Role</span><b>{ROLE_LABEL[u.role]}</b></div>
      </Section>
      <Section title={`Signed-off projects (${signed.length})`}>
        {signed.length === 0 && <p className="muted" style={{ margin: 0 }}>None yet.</p>}
        {signed.map(p => <Link key={p.id} to={`/work/${p.id}`} className="line"><span><b>{p.title}</b><small>{userById[p.owner]?.name}</small></span><I n="shield" s={16} /></Link>)}
      </Section>
    </div>
  );
}
