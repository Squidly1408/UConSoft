import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DEMO_PASSWORD, ROLE_LABEL } from "../data.js";
import { ago, fmtDate } from "../format.js";
import { defaultsFor, useStore } from "../store.jsx";
import { Err, ProfileFields, profileError } from "../components/forms.jsx";
import { Avatar, Empty, I, Modal, RolePill, Section, Status, Tabs } from "../components/ui.jsx";

/* ---------------- users ---------------- */

export function AdminUsers() {
  const { me, users, setStatus, deleteUser, flash } = useStore();
  const [params, setParams] = useSearchParams();
  const role = params.get("role") || "all";
  const status = params.get("status") || "all";
  const editing = params.get("edit");
  const creating = params.get("new") === "1";
  const [q, setQ] = useState("");
  const setParam = (k, v) => { const n = new URLSearchParams(params); if (v && v !== "all") n.set(k, v); else n.delete(k); setParams(n, { replace: true }); };

  const needle = q.toLowerCase();
  const list = users
    .filter(u => (role === "all" || u.role === role) && (status === "all" || u.status === status))
    .filter(u => !needle || [u.name, u.email].join(" ").toLowerCase().includes(needle))
    .sort((a, b) => (a.status === "pending") === (b.status === "pending") ? a.name.localeCompare(b.name) : a.status === "pending" ? -1 : 1);
  const editUser = users.find(u => u.id === editing);

  return (
    <>
      <div className="head">
        <div><h1>Users</h1><p>{users.length} accounts · {users.filter(u => u.status === "pending").length} waiting for approval</p></div>
        <button className="btn lg" onClick={() => setParam("new", "1")}><I n="plus" s={18} w={2.2} /> Create user</button>
      </div>
      <div className="tools">
        <input className="input" type="search" placeholder="Search name or email" value={q} onChange={e => setQ(e.target.value)} aria-label="Search users" />
        <select value={role} onChange={e => setParam("role", e.target.value)} aria-label="Role"><option value="all">All roles</option>{Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select value={status} onChange={e => setParam("status", e.target.value)} aria-label="Status"><option value="all">Any status</option><option value="active">Active</option><option value="pending">Pending</option><option value="suspended">Suspended</option></select>
      </div>
      <Section style={{ padding: 0 }}>
        <div className="trow thead users-cols"><span>User</span><span>Role</span><span>Status</span><span>Joined</span><span /></div>
        {list.length === 0 && <Empty icon="people">No users match.</Empty>}
        {list.map(u => (
          <div key={u.id} className="trow users-cols">
            <div className="cell-user"><Avatar u={u} size="sm2" /><div style={{ minWidth: 0 }}><Link to={`/u/${u.id}`} className="plain-link"><b>{u.name}</b></Link><small>{u.email}</small></div></div>
            <span><RolePill role={u.role} /></span>
            <span><Status s={u.status} /></span>
            <span className="muted">{fmtDate(u.createdAt)}</span>
            <div className="row-acts">
              {u.status === "pending" && <button className="btn" onClick={() => { setStatus(u.id, "active"); flash(`${u.name} approved`); }}><I n="check" s={14} w={2.2} /> Approve</button>}
              {u.id !== me.id && u.status === "active" && <button className="btn plain" onClick={() => { setStatus(u.id, "suspended"); flash(`${u.name} suspended`); }}>Suspend</button>}
              {u.status === "suspended" && <button className="btn plain" onClick={() => { setStatus(u.id, "active"); flash(`${u.name} reactivated`); }}>Reactivate</button>}
              <button className="btn plain icon" aria-label={`Edit ${u.name}`} title="Edit" onClick={() => setParam("edit", u.id)}><I n="edit" s={16} /></button>
              {u.id !== me.id && <button className="btn plain icon danger-text" aria-label={`Delete ${u.name}`} title="Delete" onClick={() => { if (confirm(`Delete ${u.name}? Their projects, opportunities and messages are removed too.`)) { deleteUser(u.id); flash("Account deleted"); } }}><I n="trash" s={16} /></button>}
            </div>
          </div>
        ))}
      </Section>
      {editUser && <UserEditor u={editUser} onClose={() => setParam("edit", null)} />}
      {creating && <UserEditor onClose={() => setParam("new", null)} />}
    </>
  );
}

function UserEditor({ u, onClose }) {
  const { me, updateUser, createUser, setStatus, flash } = useStore();
  const [f, setF] = useState(u ? { ...u, newPassword: "" } : { ...defaultsFor("student"), role: "student", name: "", email: "", status: "active", newPassword: DEMO_PASSWORD, hue: 200 });
  const [err, setErr] = useState("");
  const set = p => { setF(x => ({ ...x, ...p })); setErr(""); };
  const self = u?.id === me.id;

  const save = e => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) return setErr("Enter a valid email.");
    const pe = profileError(f);
    if (pe) return setErr(pe);
    if (!u && f.newPassword.length < 8) return setErr("Set a password of at least 8 characters.");
    const { newPassword, id, status, createdAt, views, ...patch } = f;
    if (newPassword) patch.password = newPassword;
    patch.email = f.email.trim();
    patch.name = f.name.trim();
    if (u) {
      const r = updateUser(u.id, patch);
      if (r.error) return setErr(r.error);
      if (status !== u.status) setStatus(u.id, status);
      flash("Account saved");
    } else {
      const r = createUser({ ...patch, status });
      if (r.error) return setErr(r.error);
      flash(`Created ${patch.name}`);
    }
    onClose();
  };

  return (
    <Modal title={u ? `Edit ${u.name}` : "Create user"} onClose={onClose} wide
      footer={<><button type="button" className="btn plain" onClick={onClose}>Cancel</button><button className="btn" form="user-form">{u ? "Save account" : "Create account"}</button></>}>
      <form id="user-form" onSubmit={save} className="form">
        <div className="form-grid">
          <label className="fld">{f.role === "company" ? "Company name" : "Name"}<input className="input" value={f.name} onChange={e => set({ name: e.target.value })} autoFocus={!u} /></label>
          <label className="fld">Email<input className="input" type="email" value={f.email} onChange={e => set({ email: e.target.value })} /></label>
          <label className="fld">Role
            <select value={f.role} disabled={self} onChange={e => setF(x => ({ ...defaultsFor(e.target.value), ...x, role: e.target.value }))}>
              {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          <label className="fld">Status
            <select value={f.status} disabled={self} onChange={e => set({ status: e.target.value })}>
              <option value="active">Active</option><option value="pending">Pending approval</option><option value="suspended">Suspended</option>
            </select>
          </label>
          <label className="fld span2">{u ? "Set a new password (leave blank to keep)" : "Password"}<input className="input" value={f.newPassword} onChange={e => set({ newPassword: e.target.value })} autoComplete="new-password" /></label>
        </div>
        {u && f.role !== u.role && <div className="banner" style={{ margin: 0 }}><I n="info" s={16} /><div>Changing the role keeps the account's existing data but shows different profile fields.</div></div>}
        <hr className="sep" />
        <ProfileFields f={f} set={set} />
        <Err>{err}</Err>
      </form>
    </Modal>
  );
}

/* ---------------- content ---------------- */

export function AdminContent() {
  const { projects, opps, applications, userById, moderateProject, deleteProject, toggleOpp, deleteOpp, flash } = useStore();
  const [tab, setTab] = useState("projects");
  const [filter, setFilter] = useState("all");
  const plist = projects.filter(p => filter === "all" || (filter === "flagged" ? p.flagged : p.hidden))
    .sort((a, b) => (b.flagged - a.flagged) || b.createdAt - a.createdAt);

  return (
    <>
      <div className="head"><div><h1>Content</h1><p>Moderate projects and opportunities.</p></div></div>
      <Tabs tabs={[["projects", "Projects", projects.length], ["opps", "Opportunities", opps.length]]} value={tab} onChange={setTab} />
      {tab === "projects" && <>
        <div className="seg" role="radiogroup" aria-label="Filter" style={{ marginBottom: 14 }}>
          {[["all", "All"], ["flagged", `Reported (${projects.filter(p => p.flagged).length})`], ["hidden", `Hidden (${projects.filter(p => p.hidden).length})`]].map(([k, l]) => (
            <button key={k} role="radio" aria-checked={filter === k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <Section style={{ padding: 0 }}>
          <div className="trow thead content-cols"><span>Project</span><span>Owner</span><span>State</span><span /></div>
          {plist.length === 0 && <Empty icon="check">Nothing here.</Empty>}
          {plist.map(p => (
            <div key={p.id} className="trow content-cols">
              <div style={{ minWidth: 0 }}><Link to={`/work/${p.id}`} className="plain-link"><b>{p.title}</b></Link><small className="muted" style={{ display: "block" }}>{p.type} · {p.views} views · {ago(p.createdAt)}</small>
                {p.flagged && <small style={{ display: "block", color: "var(--bad)" }}><I n="flag" s={12} /> {p.flagReason || "Reported"}</small>}</div>
              <span>{userById[p.owner]?.name}</span>
              <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{p.hidden ? <span className="pill bad">Hidden</span> : <span className="pill good">Visible</span>}{p.signOff && <Status s={p.signOff.status} />}</span>
              <div className="row-acts">
                {p.flagged && <button className="btn plain" onClick={() => { moderateProject(p.id, { flagged: false, flagReason: "" }); flash("Report cleared"); }}>Clear report</button>}
                <button className="btn plain" onClick={() => { moderateProject(p.id, { hidden: !p.hidden }); flash(p.hidden ? "Restored" : "Hidden"); }}>{p.hidden ? "Unhide" : "Hide"}</button>
                <button className="btn plain icon danger-text" aria-label={`Delete ${p.title}`} onClick={() => { if (confirm(`Delete "${p.title}"?`)) { deleteProject(p.id); flash("Project deleted"); } }}><I n="trash" s={16} /></button>
              </div>
            </div>
          ))}
        </Section>
      </>}
      {tab === "opps" && (
        <Section style={{ padding: 0 }}>
          <div className="trow thead content-cols"><span>Opportunity</span><span>Company</span><span>Status</span><span /></div>
          {opps.map(o => (
            <div key={o.id} className="trow content-cols">
              <div style={{ minWidth: 0 }}><Link to={`/opportunities/${o.id}`} className="plain-link"><b>{o.title}</b></Link><small className="muted" style={{ display: "block" }}>{o.period} · {applications.filter(a => a.opp === o.id && a.status !== "Withdrawn").length} applicants</small></div>
              <span>{userById[o.company]?.name}</span>
              <span><Status s={o.status} /></span>
              <div className="row-acts">
                <button className="btn plain" onClick={() => { toggleOpp(o.id); flash(o.status === "Open" ? "Closed" : "Reopened"); }}>{o.status === "Open" ? "Close" : "Reopen"}</button>
                <button className="btn plain icon danger-text" aria-label={`Delete ${o.title}`} onClick={() => { if (confirm(`Delete ${o.title}?`)) { deleteOpp(o.id); flash("Opportunity deleted"); } }}><I n="trash" s={16} /></button>
              </div>
            </div>
          ))}
        </Section>
      )}
    </>
  );
}

/* ---------------- activity ---------------- */

export function AdminActivity() {
  const { log, userById } = useStore();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const needle = q.toLowerCase();
  const list = log.filter(l => (role === "all" || userById[l.actor]?.role === role) && (!needle || l.text.toLowerCase().includes(needle)));

  const exportCsv = () => {
    const esc = v => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [["time", "actor", "role", "event"], ...list.map(l => [new Date(l.at).toISOString(), userById[l.actor]?.name || "", userById[l.actor]?.role || "", l.text])];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map(r => r.map(esc).join(",")).join("\n")], { type: "text/csv" }));
    a.download = "uconsoft-activity.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <div className="head"><div><h1>Activity log</h1><p>Sign-ups, approvals, sign-offs, applications and admin actions.</p></div><button className="btn plain" onClick={exportCsv}><I n="doc" s={15} /> Export CSV</button></div>
      <div className="tools">
        <input className="input" type="search" placeholder="Search events" value={q} onChange={e => setQ(e.target.value)} aria-label="Search events" />
        <select value={role} onChange={e => setRole(e.target.value)} aria-label="Actor role"><option value="all">Everyone</option>{Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}s</option>)}</select>
      </div>
      <Section>
        {list.length === 0 && <Empty icon="activity">No events match.</Empty>}
        <ul className="feed">
          {list.map(l => <li key={l.id}><Avatar u={userById[l.actor]} size="sm" /><span>{l.text}<small>{fmtDate(l.at)} · {ago(l.at)}</small></span></li>)}
        </ul>
      </Section>
    </>
  );
}
