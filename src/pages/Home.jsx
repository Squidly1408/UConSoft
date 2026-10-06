import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROLE_LABEL } from "../data.js";
import { ago, greeting } from "../format.js";
import { score } from "../matching.js";
import { useCompanyOpps, useOpenOpps, useRanked, useStudents, useVisibleProjects } from "../hooks.js";
import { useStore } from "../store.jsx";
import { DecideSignOff, OppForm, ProjectForm } from "../components/forms.jsx";
import {
  Avatar, Bars, Breakdown, Completeness, Empty, I, MatchRow, OppList, OppPicker, Ring, Section, StatCard, Status, Talent, UserRow, WorkCard,
} from "../components/ui.jsx";

const first = n => n.replace(/^(Dr|Assoc Prof|Prof)\s+/, "").split(" ")[0];

export default function Home() {
  const { me } = useStore();
  if (me.role === "student") return <StudentHome />;
  if (me.role === "staff") return <StaffHome />;
  if (me.role === "company") return <CompanyHome />;
  return <AdminHome />;
}

/* ---------------- student ---------------- */

function StudentHome() {
  const { me, projects, applications, saveProject, flash } = useStore();
  const openOpps = useOpenOpps();
  const visible = useVisibleProjects();
  const [adding, setAdding] = useState(false);
  const nav = useNavigate();
  const mine = projects.filter(p => p.owner === me.id);
  const myApps = applications.filter(a => a.student === me.id).sort((a, b) => b.updatedAt - a.updatedAt);
  const active = myApps.filter(a => !["Withdrawn", "Unsuccessful"].includes(a.status));
  const recs = useMemo(() => openOpps.map(o => ({ o, m: score(me, o, projects) })).sort((a, b) => b.m.total - a.m.total).slice(0, 4), [openOpps, me, projects]);
  const others = visible.filter(p => p.owner !== me.id).sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  const pendingSO = mine.filter(p => p.signOff && p.signOff.status !== "approved");

  return (
    <>
      <div className="head">
        <div><h1>{greeting()}, {first(me.name)}</h1><p>Here's how your portfolio and applications are going.</p></div>
        <button className="btn lg" onClick={() => setAdding(true)}><I n="plus" s={18} w={2.2} /> Add a project</button>
      </div>
      <div className="stats">
        <StatCard icon="file" label="Projects" value={mine.length} cta="Portfolio" to="/portfolio" />
        <StatCard icon="shield" label="Signed off" value={mine.filter(p => p.signOff?.status === "approved").length} cta="Request" to="/portfolio" />
        <StatCard icon="eye" label="Profile views" value={me.views || 0} cta="My profile" to={`/u/${me.id}`} />
        <StatCard icon="doc" label="Active applications" value={active.length} cta="Track" to="/applications" />
      </div>
      <div className="grid2">
        <Section title="Recommended for you" action={<Link className="link" to="/opportunities">All opportunities <I n="arrow" s={14} /></Link>}>
          {recs.length === 0 && <Empty icon="brief">No open opportunities right now. Check back soon.</Empty>}
          {recs.map(({ o, m }) => {
            const applied = myApps.find(a => a.opp === o.id && a.status !== "Withdrawn");
            return (
              <Link key={o.id} to={`/opportunities/${o.id}`} className="opp-card">
                <Ring v={m.total} size={50} />
                <div style={{ minWidth: 0 }}>
                  <b>{o.title}</b>
                  <div className="meta">{o.co.name} · {o.period} · {o.mode}</div>
                  <div className="chips">{m.matched.slice(0, 3).map(s => <span key={s} className="chip ok">{s}</span>)}{m.missing.slice(0, 2).map(s => <span key={s} className="chip">{s}</span>)}</div>
                </div>
                {applied ? <Status s={applied.status} /> : <I n="chev" s={16} />}
              </Link>
            );
          })}
        </Section>
        <div className="stack">
          <Completeness u={me} />
          <Section title="Applications" action={<Link className="link" to="/applications">View all</Link>}>
            {myApps.length === 0 ? <p className="muted" style={{ margin: 0 }}>You haven't applied for anything yet.</p>
              : myApps.slice(0, 4).map(a => <AppLine key={a.id} a={a} />)}
          </Section>
          {pendingSO.length > 0 && (
            <Section title="Sign-offs in progress">
              {pendingSO.map(p => (
                <Link key={p.id} to={`/work/${p.id}`} className="line"><span>{p.title}</span><Status s={p.signOff.status} /></Link>
              ))}
            </Section>
          )}
        </div>
      </div>
      <Section title="New from other students" action={<Link className="link" to="/discover">Discover <I n="arrow" s={14} /></Link>}>
        <div className="works">{others.map(p => <WorkCard key={p.id} p={p} />)}</div>
      </Section>
      {adding && <ProjectForm onClose={() => setAdding(false)} onSave={p => { const id = saveProject(p); setAdding(false); flash("Project published"); nav(`/work/${id}`); }} />}
    </>
  );
}

function AppLine({ a }) {
  const { opps, userById } = useStore();
  const o = opps.find(x => x.id === a.opp);
  if (!o) return null;
  return (
    <Link to={`/opportunities/${o.id}`} className="line">
      <span style={{ minWidth: 0 }}><b>{o.title}</b><small>{userById[o.company]?.name} · updated {ago(a.updatedAt)}</small></span><Status s={a.status} />
    </Link>
  );
}

/* ---------------- staff ---------------- */

function StaffHome() {
  const { me, projects, userById, opps } = useStore();
  const students = useStudents();
  const visible = useVisibleProjects();
  const [review, setReview] = useState(null);
  const queue = projects.filter(p => p.signOff?.status === "requested" && p.signOff.approver === me.id).sort((a, b) => a.signOff.at - b.signOff.at);
  const decided = projects.filter(p => p.signOff && p.signOff.approver === me.id && p.signOff.status !== "requested").sort((a, b) => b.signOff.at - a.signOff.at);

  return (
    <>
      <div className="head"><div><h1>{greeting()}, {first(me.name)}</h1><p>{queue.length ? `${queue.length} project${queue.length > 1 ? "s" : ""} waiting for your sign-off.` : "You're all caught up on sign-offs."}</p></div></div>
      <div className="stats">
        <StatCard icon="shield" label="Awaiting your sign-off" value={queue.length} cta="Review" to="/signoffs" />
        <StatCard icon="check" label="Signed off by you" value={decided.filter(p => p.signOff.status === "approved").length} />
        <StatCard icon="people" label="Students" value={students.length} cta="Browse" to="/people" />
        <StatCard icon="brief" label="Open opportunities" value={opps.filter(o => o.status === "Open").length} cta="View" to="/opportunities" />
      </div>
      <div className="grid2">
        <Section title="Waiting for your sign-off" action={<Link className="link" to="/signoffs">All requests <I n="arrow" s={14} /></Link>}>
          {queue.length === 0 && <Empty icon="check">Nothing waiting. Students will show up here when they ask you to verify their work.</Empty>}
          {queue.slice(0, 5).map(p => (
            <div key={p.id} className="queue-row">
              <Avatar u={userById[p.owner]} size="sm2" />
              <div style={{ minWidth: 0 }}>
                <Link to={`/work/${p.id}`} className="plain-link"><b>{p.title}</b></Link>
                <div className="meta">{userById[p.owner]?.name} · {p.type}{p.course ? ` · ${p.course}` : ""} · asked {ago(p.signOff.at)}</div>
              </div>
              <button className="btn" onClick={() => setReview(p)}>Review</button>
            </div>
          ))}
        </Section>
        <div className="stack">
          <Completeness u={me} />
          <Section title="Recently decided">
            {decided.length === 0 ? <p className="muted" style={{ margin: 0 }}>No decisions yet.</p>
              : decided.slice(0, 5).map(p => <Link key={p.id} to={`/work/${p.id}`} className="line"><span>{p.title}<small>{userById[p.owner]?.name}</small></span><Status s={p.signOff.status} /></Link>)}
          </Section>
          <Talent />
        </div>
      </div>
      <Section title="Latest student work" action={<Link className="link" to="/discover">See all <I n="arrow" s={14} /></Link>}>
        <div className="works">{[...visible].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4).map(p => <WorkCard key={p.id} p={p} />)}</div>
      </Section>
      {review && <DecideSignOff p={review} onClose={() => setReview(null)} />}
    </>
  );
}

/* ---------------- company ---------------- */

function CompanyHome() {
  const { me, shortlists, applications, saveOpp, flash } = useStore();
  const { mine, open, opp } = useCompanyOpps();
  const ranked = useRanked(opp);
  const visible = useVisibleProjects();
  const [sel, setSel] = useState(null);
  const [creating, setCreating] = useState(false);
  const nav = useNavigate();
  const selected = ranked.find(r => r.st.id === sel) || ranked[0];
  const myOppIds = new Set(mine.map(o => o.id));
  const newApps = applications.filter(a => myOppIds.has(a.opp) && a.status === "Submitted").length;
  const pending = me.status !== "active";

  return (
    <>
      <div className="head">
        <div><h1>{greeting()}, {me.name}</h1><p>Find students whose skills and project experience match your WIL opportunities.</p></div>
        <button className="btn lg" onClick={() => setCreating(true)} disabled={pending} title={pending ? "Available once your account is verified" : undefined}><I n="plus" s={18} w={2.2} /> Create WIL Opportunity</button>
      </div>

      <div className="stats">
        <StatCard icon="brief" label="Active opportunities" value={open.length} cta="View all" to="/opportunities" />
        <StatCard icon="people" label="Recommended students" value={ranked.filter(r => r.m.total >= 70).length} cta="View matches" to="/students" />
        <StatCard icon="bookmark" label="Shortlisted" value={Object.keys(shortlists[me.id] || {}).length} cta="Shortlist" to="/shortlist" />
        <StatCard icon="doc" label="New applications" value={newApps} cta="Review" to={opp ? `/opportunities/${opp.id}` : "/opportunities"} />
      </div>

      {!opp ? (
        <div className="grid2">
          <Section title="Get started"><Empty icon="brief" action={!pending && <button className="btn" onClick={() => setCreating(true)}>Create your first opportunity</button>}>
            Post a WIL opportunity and UConSoft will rank students against it straight away.</Empty></Section>
          <Completeness u={me} />
        </div>
      ) : (
        <div className="grid2">
          <Section title="Best matches for your opportunities" action={<Link className="link" to="/students">View all matches <I n="arrow" s={14} /></Link>}>
            <div style={{ marginBottom: 6 }}><OppPicker opps={open.length ? open : mine} /></div>
            {ranked.slice(0, 4).map((r, i) => (
              <MatchRow key={r.st.id} st={r.st} m={r.m} rank={i + 1} selected={r.st.id === selected?.st.id} onSelect={() => setSel(r.st.id)} />
            ))}
          </Section>
          {selected && <Breakdown st={selected.st} m={selected.m} />}
        </div>
      )}

      <div className="grid2">
        <Section title="Featured student work" action={<Link className="link" to="/discover">View more work <I n="arrow" s={14} /></Link>}>
          <div className="works">{[...visible].sort((a, b) => b.views - a.views).slice(0, 3).map(p => <WorkCard key={p.id} p={p} />)}</div>
        </Section>
        <div className="stack">
          {opp && <Completeness u={me} />}
          <Talent />
          <Section title="Your opportunities" action={<Link className="link" to="/opportunities">Manage <I n="arrow" s={14} /></Link>}>
            <OppList opps={open.slice(0, 3)} onPick={id => nav(`/opportunities/${id}`)} />
          </Section>
        </div>
      </div>

      {creating && <OppForm onClose={() => setCreating(false)} onSave={o => { const id = saveOpp(o); setCreating(false); flash(`Posted ${o.title}. Matches updated.`); nav(`/opportunities/${id}`); }} />}
    </>
  );
}

/* ---------------- admin ---------------- */

function AdminHome() {
  const { users, projects, opps, log, userById, setStatus, deleteUser, flash } = useStore();
  const pending = users.filter(u => u.status === "pending");
  const flagged = projects.filter(p => p.flagged);
  const byRole = Object.keys(ROLE_LABEL).map(r => [ROLE_LABEL[r], users.filter(u => u.role === r).length]);

  return (
    <>
      <div className="head"><div><h1>Admin dashboard</h1><p>Accounts, content and activity across UConSoft.</p></div>
        <Link className="btn lg" to="/admin/users?new=1"><I n="plus" s={18} w={2.2} /> Create user</Link></div>
      <div className="stats">
        <StatCard icon="people" label="Users" value={users.length} cta="Manage" to="/admin/users" />
        <StatCard icon="clock" label="Waiting for approval" value={pending.length} cta="Review" to="/admin/users?status=pending" />
        <StatCard icon="flag" label="Reported projects" value={flagged.length} cta="Moderate" to="/admin/content" />
        <StatCard icon="brief" label="Open opportunities" value={opps.filter(o => o.status === "Open").length} cta="View" to="/opportunities" />
      </div>
      <div className="grid2">
        <div className="stack">
          <Section title="Waiting for approval">
            {pending.length === 0 && <Empty icon="check">No accounts waiting.</Empty>}
            {pending.map(u => (
              <UserRow key={u.id} u={u} sub={`${ROLE_LABEL[u.role]} · ${u.email} · joined ${ago(u.createdAt)}`} right={<>
                <button className="btn plain" onClick={() => { if (confirm(`Decline and delete ${u.name}'s registration?`)) { deleteUser(u.id); flash("Registration declined"); } }}>Decline</button>
                <button className="btn" onClick={() => { setStatus(u.id, "active"); flash(`${u.name} approved`); }}><I n="check" s={15} w={2.2} /> Approve</button>
              </>} />
            ))}
          </Section>
          <Section title="Reported projects" action={<Link className="link" to="/admin/content">Content <I n="arrow" s={14} /></Link>}>
            {flagged.length === 0 ? <p className="muted" style={{ margin: 0 }}>No reports. </p>
              : flagged.map(p => <Link key={p.id} to={`/work/${p.id}`} className="line"><span>{p.title}<small>{p.flagReason || "Reported"} · {userById[p.owner]?.name}</small></span><I n="chev" s={16} /></Link>)}
          </Section>
        </div>
        <div className="stack">
          <Section title="Users by role"><Bars rows={byRole} label={130} max={Math.max(...byRole.map(r => r[1]))} /></Section>
          <Section title="Recent activity" action={<Link className="link" to="/admin/activity">Full log <I n="arrow" s={14} /></Link>}>
            <ul className="feed">{log.slice(0, 7).map(l => <li key={l.id}><Avatar u={userById[l.actor]} size="sm" /><span>{l.text}<small>{ago(l.at)}</small></span></li>)}</ul>
          </Section>
        </div>
      </div>
    </>
  );
}
