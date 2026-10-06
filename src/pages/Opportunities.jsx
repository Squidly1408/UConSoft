import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { APP_STATUSES, DISCIPLINES, WORK_MODES } from "../data.js";
import { ago, fmtMonth } from "../format.js";
import { score } from "../matching.js";
import { useCompanyOpps, useOpenOpps, useRanked } from "../hooks.js";
import { useStore } from "../store.jsx";
import { ApplyModal, OppForm } from "../components/forms.jsx";
import { Avatar, Breakdown, Empty, I, MatchRow, OppList, Ring, Section, Status, Tabs } from "../components/ui.jsx";

export function Opportunities() {
  const { me } = useStore();
  if (me.role === "company") return <CompanyOpps />;
  return <BrowseOpps />;
}

function CompanyOpps() {
  const { me, saveOpp, flash } = useStore();
  const { mine } = useCompanyOpps();
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState("Open");
  const nav = useNavigate();
  const list = mine.filter(o => o.status === tab);
  const pending = me.status !== "active";
  return (
    <>
      <div className="head">
        <div><h1>Opportunities</h1><p>Your WIL roles. Open one to see applicants and ranked candidates.</p></div>
        <button className="btn lg" onClick={() => setCreating(true)} disabled={pending} title={pending ? "Available once your account is verified" : undefined}><I n="plus" s={18} w={2.2} /> Create WIL Opportunity</button>
      </div>
      <Tabs tabs={[["Open", "Open", mine.filter(o => o.status === "Open").length], ["Closed", "Closed", mine.filter(o => o.status === "Closed").length]]} value={tab} onChange={setTab} />
      <Section><OppList opps={list} onPick={id => nav(`/opportunities/${id}`)} /></Section>
      {creating && <OppForm onClose={() => setCreating(false)} onSave={o => { const id = saveOpp(o); setCreating(false); flash(`Posted ${o.title}`); nav(`/opportunities/${id}`); }} />}
    </>
  );
}

function BrowseOpps() {
  const { me, projects, applications, opps, userById } = useStore();
  const open = useOpenOpps();
  const isStudent = me.role === "student";
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("All");
  const [disc, setDisc] = useState(isStudent ? me.discipline : "All");
  const [sort, setSort] = useState(isStudent ? "match" : "newest");
  const [showClosed, setShowClosed] = useState(false);

  const source = me.role === "admin" && showClosed ? opps.map(o => ({ ...o, co: userById[o.company] })) : open;
  const rows = useMemo(() => {
    const needle = q.toLowerCase();
    return source
      .filter(o => (mode === "All" || o.mode === mode) && (disc === "All" || o.disciplines.includes(disc)))
      .filter(o => !needle || [o.title, o.desc, o.co?.name, ...o.skills].join(" ").toLowerCase().includes(needle))
      .map(o => ({ o, m: isStudent ? score(me, o, projects) : null }))
      .sort((a, b) => (sort === "match" && isStudent ? b.m.total - a.m.total : b.o.createdAt - a.o.createdAt));
  }, [source, q, mode, disc, sort, me, projects]);

  return (
    <>
      <div className="head"><div><h1>Opportunities</h1><p>{isStudent ? "WIL placements and internships, ranked by how well they fit your profile." : "Open WIL roles posted by industry partners."}</p></div></div>
      <div className="tools">
        <input className="input" type="search" placeholder="Search roles, companies, skills" value={q} onChange={e => setQ(e.target.value)} aria-label="Search opportunities" />
        <select value={disc} onChange={e => setDisc(e.target.value)} aria-label="Discipline"><option value="All">All disciplines</option>{DISCIPLINES.map(d => <option key={d}>{d}</option>)}</select>
        <select value={mode} onChange={e => setMode(e.target.value)} aria-label="Work mode"><option value="All">Any work mode</option>{WORK_MODES.map(d => <option key={d}>{d}</option>)}</select>
        {isStudent && <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort"><option value="match">Best match</option><option value="newest">Newest</option></select>}
        {me.role === "admin" && <label className="fld inline"><input type="checkbox" checked={showClosed} onChange={e => setShowClosed(e.target.checked)} /> Include closed</label>}
      </div>
      {rows.length === 0 ? <Section><Empty icon="brief">No opportunities match these filters.</Empty></Section> : (
        <div className="opp-grid">
          {rows.map(({ o, m }) => {
            const mine = applications.find(a => a.opp === o.id && a.student === me.id && a.status !== "Withdrawn");
            const n = applications.filter(a => a.opp === o.id && a.status !== "Withdrawn").length;
            return (
              <Link key={o.id} to={`/opportunities/${o.id}`} className="panel opp-tile">
                <div className="ot-h">
                  <Avatar u={o.co} size="sm2" />
                  <div style={{ minWidth: 0 }}><b>{o.title}</b><small>{o.co?.name}</small></div>
                  {m && <Ring v={m.total} size={46} />}
                </div>
                <p className="muted">{o.desc}</p>
                <div className="facts small">
                  <span><I n="clock" s={14} /> {o.period}</span><span><I n="pin" s={14} /> {o.mode} · {o.location}</span>{o.paid && <span>Paid</span>}
                </div>
                <div className="chips">{o.skills.slice(0, 5).map(s => <span key={s} className={"chip" + (m?.matched.includes(s) ? " ok" : "")}>{s}</span>)}</div>
                <div className="ot-f">
                  {mine ? <Status s={mine.status} /> : o.status !== "Open" ? <Status s={o.status} /> : <span className="muted" style={{ fontSize: 12 }}>Posted {ago(o.createdAt)}{!isStudent && ` · ${n} applicant${n === 1 ? "" : "s"}`}</span>}
                  <span className="link">View <I n="arrow" s={14} /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

export function OpportunityDetail() {
  const { id } = useParams();
  const { opps, me, userById } = useStore();
  const o = opps.find(x => x.id === id);
  if (!o || (userById[o.company]?.status !== "active" && me.role !== "admin" && me.id !== o.company)) {
    return <Section><Empty icon="brief">This opportunity no longer exists. <Link className="link" to="/opportunities">Back to opportunities</Link></Empty></Section>;
  }
  return me.id === o.company ? <OwnerView o={o} /> : <PublicView o={o} />;
}

function About({ o }) {
  const { userById } = useStore();
  const co = userById[o.company];
  return (
    <Section title="About this role">
      <p style={{ marginTop: 0 }}>{o.desc || "No description yet."}</p>
      <div className="kv"><span>Period</span><b>{o.period}</b></div>
      <div className="kv"><span>Starts</span><b>{fmtMonth(o.start)}</b></div>
      <div className="kv"><span>Work mode</span><b>{o.mode}</b></div>
      <div className="kv"><span>Location</span><b>{o.location}</b></div>
      <div className="kv"><span>Paid</span><b>{o.paid ? "Yes" : "No"}</b></div>
      <h3 className="h3">Required skills</h3>
      <div className="chips">{o.skills.map(s => <span key={s} className="chip">{s}</span>)}</div>
      <h3 className="h3">Preferred disciplines</h3>
      <div className="chips">{o.disciplines.map(s => <span key={s} className="chip">{s}</span>)}</div>
      <h3 className="h3">Themes</h3>
      <div className="chips">{o.themes.map(s => <span key={s} className="chip">{s}</span>)}</div>
      {co && <>
        <hr className="sep" />
        <Link to={`/u/${co.id}`} className="owner"><Avatar u={co} /><div><b>{co.name}</b><small>{co.industry} · {co.location}</small></div></Link>
      </>}
    </Section>
  );
}

function OwnerView({ o }) {
  const { applications, userById, projects, saveOpp, toggleOpp, deleteOpp, pickOpp, setAppStatus, startThread, flash } = useStore();
  const ranked = useRanked(o);
  const [tab, setTab] = useState("applicants");
  const [editing, setEditing] = useState(false);
  const nav = useNavigate();
  const apps = applications.filter(a => a.opp === o.id).map(a => ({ a, st: userById[a.student] })).filter(x => x.st)
    .map(x => ({ ...x, m: score(x.st, o, projects) })).sort((x, y) => (x.a.status === "Withdrawn") - (y.a.status === "Withdrawn") || y.m.total - x.m.total);
  const active = apps.filter(x => x.a.status !== "Withdrawn").length;

  return (
    <>
      <Link className="link page-back" to="/opportunities"><I n="back" s={14} /> All opportunities</Link>
      <div className="head">
        <div><h1>{o.title}</h1><p>{o.period} · {active} applicant{active === 1 ? "" : "s"} · <Status s={o.status} /></p></div>
        <div className="form-actions">
          <button className="btn plain" onClick={() => setEditing(true)}><I n="edit" s={15} /> Edit</button>
          <button className="btn plain" onClick={() => { toggleOpp(o.id); flash(o.status === "Open" ? "Opportunity closed" : "Opportunity reopened"); }}>{o.status === "Open" ? "Close" : "Reopen"}</button>
          <button className="btn plain danger-text" onClick={() => { if (confirm(`Delete ${o.title} and its applications?`)) { deleteOpp(o.id); flash("Opportunity deleted"); nav("/opportunities"); } }}><I n="trash" s={15} /></button>
          <button className="btn" onClick={() => { pickOpp(o.id); nav("/students"); }}><I n="search" s={15} /> Find students</button>
        </div>
      </div>
      <Tabs tabs={[["applicants", "Applicants", active], ["ranked", "Ranked candidates", ranked.length]]} value={tab} onChange={setTab} />
      <div className="grid2">
        <Section>
          {tab === "applicants" && (apps.length === 0 ? <Empty icon="doc">No applications yet. Students can apply once they find this role, or you can reach out to ranked candidates.</Empty> :
            apps.map(({ a, st, m }) => (
              <div key={a.id} className={"applicant" + (a.status === "Withdrawn" ? " dim" : "")}>
                <Avatar u={st} />
                <div style={{ minWidth: 0 }}>
                  <Link to={`/u/${st.id}`} className="plain-link"><b>{st.name}</b></Link>
                  <div className="meta">{st.degree} · applied {ago(a.at)}</div>
                  {a.cover && <p className="cover">“{a.cover}”</p>}
                </div>
                <Ring v={m.total} size={50} />
                <div className="applicant-acts">
                  {a.status === "Withdrawn" ? <Status s="Withdrawn" /> : (
                    <select aria-label={`Status for ${st.name}`} value={a.status} onChange={e => { setAppStatus(a.id, e.target.value); flash(`${st.name}: ${e.target.value}`); }}>
                      {APP_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  )}
                  <button className="btn plain icon" aria-label={`Message ${st.name}`} title="Message" onClick={() => nav(`/messages?t=${startThread(st.id, o.title)}`)}><I n="msg" s={16} /></button>
                </div>
              </div>
            )))}
          {tab === "ranked" && ranked.map((r, i) => <MatchRow key={r.st.id} st={r.st} m={r.m} rank={i + 1} />)}
        </Section>
        <About o={o} />
      </div>
      {editing && <OppForm initial={o} onClose={() => setEditing(false)} onSave={n => { saveOpp(n); setEditing(false); flash("Changes saved"); }} />}
    </>
  );
}

function PublicView({ o }) {
  const { me, applications, projects, withdraw, toggleOpp, deleteOpp, flash } = useStore();
  const [applying, setApplying] = useState(false);
  const nav = useNavigate();
  const isStudent = me.role === "student";
  const mine = applications.find(a => a.opp === o.id && a.student === me.id);
  const appliedNow = mine && mine.status !== "Withdrawn";
  const m = isStudent ? score(me, o, projects) : null;
  const n = applications.filter(a => a.opp === o.id && a.status !== "Withdrawn").length;

  return (
    <>
      <Link className="link page-back" to="/opportunities"><I n="back" s={14} /> All opportunities</Link>
      <div className="head">
        <div><h1>{o.title}</h1><p>{o.period} · {o.mode} · {o.status === "Open" ? `${n} applicant${n === 1 ? "" : "s"}` : <Status s={o.status} />}</p></div>
        <div className="form-actions">
          {isStudent && appliedNow && <>
            <Status s={mine.status} />
            {!["Offer", "Unsuccessful"].includes(mine.status) && <button className="btn plain" onClick={() => { if (confirm("Withdraw your application?")) { withdraw(mine.id); flash("Application withdrawn"); } }}>Withdraw</button>}
          </>}
          {isStudent && !appliedNow && o.status === "Open" && <button className="btn lg" onClick={() => setApplying(true)}><I n="send" s={16} /> {mine ? "Apply again" : "Apply now"}</button>}
          {me.role === "admin" && <>
            <button className="btn plain" onClick={() => { toggleOpp(o.id); flash(o.status === "Open" ? "Opportunity closed" : "Opportunity reopened"); }}>{o.status === "Open" ? "Close" : "Reopen"}</button>
            <button className="btn plain danger-text" onClick={() => { if (confirm(`Delete ${o.title}?`)) { deleteOpp(o.id); nav("/opportunities"); } }}><I n="trash" s={15} /> Delete</button>
          </>}
        </div>
      </div>
      <div className="grid2">
        <About o={o} />
        {m ? <div className="stack">
          <Breakdown st={me} m={m} title={`Your match: ${m.total}%`} />
          {m.missing.length > 0 && (
            <Section title="Strengthen your match">
              <p className="muted" style={{ marginTop: 0 }}>This role asks for skills that aren't on your profile yet. If you have them, add them, or publish a project that shows them.</p>
              <div className="chips">{m.missing.map(s => <span key={s} className="chip">{s}</span>)}</div>
              <div className="form-actions" style={{ marginTop: 12, justifyContent: "flex-start" }}><Link className="btn plain" to="/settings">Edit skills</Link><Link className="btn plain" to="/portfolio">Add a project</Link></div>
            </Section>
          )}
        </div> : <div />}
      </div>
      {applying && <ApplyModal opp={o} onClose={() => setApplying(false)} />}
    </>
  );
}
