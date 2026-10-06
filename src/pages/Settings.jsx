import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ROLE_LABEL } from "../data.js";
import { fmtDate } from "../format.js";
import { useStore } from "../store.jsx";
import { Err, ProfileFields, profileError } from "../components/forms.jsx";
import { Avatar, I, Section, Status, Tabs } from "../components/ui.jsx";

export default function Settings() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  return (
    <>
      <div className="head"><div><h1>Settings</h1><p>Your profile, sign-in details and preferences.</p></div></div>
      <Tabs tabs={[["profile", "Profile"], ["account", "Account"], ["prefs", "Preferences"]]} value={tab} onChange={t => setParams(t === "profile" ? {} : { tab: t }, { replace: true })} />
      {tab === "profile" && <ProfileTab />}
      {tab === "account" && <AccountTab />}
      {tab === "prefs" && <PrefsTab />}
    </>
  );
}

function ProfileTab() {
  const { me, updateUser, flash } = useStore();
  const [f, setF] = useState(me);
  const [err, setErr] = useState("");
  const dirty = JSON.stringify(f) !== JSON.stringify(me);
  const set = p => { setF(x => ({ ...x, ...p })); setErr(""); };
  const save = e => {
    e.preventDefault();
    const pe = profileError(f);
    if (pe) return setErr(pe);
    const { id, role, status, email, password, createdAt, views, ...patch } = f;
    updateUser(me.id, { ...patch, name: f.name.trim() });
    flash("Profile saved");
  };
  return (
    <form onSubmit={save} className="settings-grid">
      <Section title="Public profile" action={<Link className="link" to={`/u/${me.id}`}>View as others see it <I n="external" s={14} /></Link>}>
        <div className="form">
          <div className="avatar-edit">
            <Avatar u={f} size="lg" />
            <label className="fld" style={{ flex: 1 }}>Avatar colour
              <input type="range" min="0" max="359" value={f.hue} onChange={e => set({ hue: +e.target.value })} className="hue" />
            </label>
          </div>
          <label className="fld">{me.role === "company" ? "Company name" : "Display name"}<input className="input" value={f.name} onChange={e => set({ name: e.target.value })} /></label>
          <ProfileFields f={f} set={set} />
          <Err>{err}</Err>
        </div>
      </Section>
      <div className="save-bar">
        <span className="muted">{dirty ? "You have unsaved changes." : "All changes saved."}</span>
        <button type="button" className="btn plain" disabled={!dirty} onClick={() => { setF(me); setErr(""); }}>Discard</button>
        <button className="btn" disabled={!dirty}>Save profile</button>
      </div>
    </form>
  );
}

function AccountTab() {
  const { me, updateUser, changePassword, deleteUser, flash } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState(me.email);
  const [emailErr, setEmailErr] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErr, setPwErr] = useState("");
  const [del, setDel] = useState("");

  const saveEmail = e => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setEmailErr("Enter a valid email address.");
    const r = updateUser(me.id, { email: email.trim() });
    if (r.error) return setEmailErr(r.error);
    flash("Email updated");
  };
  const savePw = e => {
    e.preventDefault();
    if (pw.next.length < 8) return setPwErr("Use at least 8 characters.");
    if (pw.next !== pw.confirm) return setPwErr("The new passwords don't match.");
    const r = changePassword(pw.current, pw.next);
    if (r.error) return setPwErr(r.error);
    setPw({ current: "", next: "", confirm: "" });
    flash("Password changed");
  };

  return (
    <div className="settings-grid">
      <Section title="Account">
        <div className="kv"><span>Account type</span><b>{ROLE_LABEL[me.role]}</b></div>
        <div className="kv"><span>Status</span><Status s={me.status} /></div>
        <div className="kv"><span>Member since</span><b>{fmtDate(me.createdAt)}</b></div>
      </Section>
      <Section title="Email">
        <form onSubmit={saveEmail} className="form">
          <label className="fld">Sign-in email<input className="input" type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailErr(""); }} /></label>
          <Err>{emailErr}</Err>
          <div className="form-actions"><button className="btn" disabled={email === me.email}>Update email</button></div>
        </form>
      </Section>
      <Section title="Password">
        <form onSubmit={savePw} className="form">
          <label className="fld">Current password<input className="input" type="password" autoComplete="current-password" value={pw.current} onChange={e => { setPw({ ...pw, current: e.target.value }); setPwErr(""); }} /></label>
          <div className="form-grid">
            <label className="fld">New password<input className="input" type="password" autoComplete="new-password" value={pw.next} onChange={e => { setPw({ ...pw, next: e.target.value }); setPwErr(""); }} /></label>
            <label className="fld">Confirm new password<input className="input" type="password" autoComplete="new-password" value={pw.confirm} onChange={e => { setPw({ ...pw, confirm: e.target.value }); setPwErr(""); }} /></label>
          </div>
          <Err>{pwErr}</Err>
          <div className="form-actions"><button className="btn" disabled={!pw.current || !pw.next}>Change password</button></div>
        </form>
      </Section>
      <Section title="Delete account" className="danger">
        <p className="muted" style={{ marginTop: 0 }}>This removes your profile{me.role === "student" ? ", projects and applications" : me.role === "company" ? ", opportunities and their applications" : ""} and your conversations. It can't be undone.</p>
        <div className="form-actions" style={{ justifyContent: "flex-start" }}>
          <input className="input" style={{ maxWidth: 220 }} value={del} onChange={e => setDel(e.target.value)} placeholder='Type "DELETE" to confirm' aria-label="Type DELETE to confirm" />
          <button className="btn danger" disabled={del !== "DELETE" || me.role === "admin"} onClick={() => { deleteUser(me.id); nav("/"); }}>Delete my account</button>
        </div>
        {me.role === "admin" && <small className="hint">Administrator accounts must be removed by another administrator.</small>}
      </Section>
    </div>
  );
}

function PrefsTab() {
  const { theme, setTheme, reset } = useStore();
  return (
    <div className="settings-grid">
      <Section title="Appearance">
        <div className="seg" role="radiogroup" aria-label="Theme">
          {[["system", "Match system"], ["light", "Light"], ["dark", "Dark"]].map(([k, l]) => (
            <button key={k} role="radio" aria-checked={theme === k} className={theme === k ? "on" : ""} onClick={() => setTheme(k)}>{l}</button>
          ))}
        </div>
      </Section>
      <Section title="Demo data">
        <p className="muted" style={{ marginTop: 0 }}>Everything you change is saved in this browser. Resetting brings back the original example accounts, projects and messages.</p>
        <button className="btn plain" onClick={reset}>Reset demo data</button>
      </Section>
    </div>
  );
}
