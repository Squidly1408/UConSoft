import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, ROLE_LABEL } from "../data.js";
import { defaultsFor, useStore } from "../store.jsx";
import { Err, ProfileFields, profileError } from "../components/forms.jsx";
import { Avatar, I } from "../components/ui.jsx";

function AuthShell({ children }) {
  const { toast } = useStore();
  return (
    <div className="auth">
      <aside className="auth-brand">
        <Link to="/" className="logo">UCon<span>Soft</span></Link>
        <div>
          <h1>Show your work.<br />Get matched with industry.</h1>
          <p>The University of Newcastle's Work Integrated Learning network for students, staff and industry partners.</p>
        </div>
        <div className="motto" style={{ background: "none", padding: 0 }}>REAL IDEAS. BRIGHTER FUTURES.<i /></div>
      </aside>
      <main className="auth-main">{children}</main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export function Login() {
  const { me, login, loginAs, userById, flash } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const to = loc.state?.from || "/";
  if (me) return <Navigate to={to} replace />;

  const submit = e => {
    e.preventDefault();
    if (!email.trim() || !password) return setErr("Enter your email and password.");
    const r = login(email, password);
    if (r.error) return setErr(r.error);
    nav(to, { replace: true });
  };

  return (
    <AuthShell>
      <div className="auth-card">
        <h2>Sign in</h2>
        <p className="muted">Welcome back. New here? <Link to="/signup" className="link">Create an account</Link></p>
        <form onSubmit={submit} className="form">
          <label className="fld">Email<input className="input" type="email" autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); setErr(""); }} autoFocus /></label>
          <label className="fld">Password
            <div className="pw">
              <input className="input" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => { setPassword(e.target.value); setErr(""); }} />
              <button type="button" className="link" onClick={() => setShow(s => !s)}>{show ? "Hide" : "Show"}</button>
            </div>
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="link" onClick={() => flash(`Demo build: every seeded account uses the password ${DEMO_PASSWORD}`)}>Forgot password?</button>
          </div>
          <Err>{err}</Err>
          <button className="btn lg block">Sign in</button>
        </form>
        <div className="divider"><span>or try a demo account</span></div>
        <div className="demo-accounts">
          {DEMO_ACCOUNTS.map(([id, label]) => {
            const u = userById[id];
            if (!u) return null;
            return (
              <button key={id} className="demo" onClick={() => { loginAs(id); nav(to, { replace: true }); }}>
                <Avatar u={u} size="sm2" /><span><b>{label}</b><small>{u.name}</small></span><I n="arrow" s={14} />
              </button>
            );
          })}
        </div>
      </div>
    </AuthShell>
  );
}

const ROLE_CARDS = [
  ["student", "user", "I'm a student", "Build a portfolio, get projects signed off and apply for WIL placements."],
  ["staff", "shield", "I'm university staff", "Sign off student work and follow how your students are going."],
  ["company", "building", "I represent a company", "Post WIL opportunities and find students whose work fits."],
];
const EMAIL_RULE = {
  student: [/@uon\.edu\.au$/i, "Use your student email ending in @uon.edu.au", "you@uon.edu.au"],
  staff: [/@newcastle\.edu\.au$/i, "Use your staff email ending in @newcastle.edu.au", "you@newcastle.edu.au"],
  company: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid work email", "you@company.com"],
};

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export function Signup() {
  const { me, signup } = useStore();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ role: "", name: "", email: "", password: "", confirm: "", terms: false });
  const [err, setErr] = useState("");
  const nav = useNavigate();
  if (me && step === 0) return <Navigate to="/" replace />;
  const set = p => { setF(x => ({ ...x, ...p })); setErr(""); };

  const pick = role => { setF(x => ({ ...defaultsFor(role), ...x, role })); setStep(1); setErr(""); };

  const account = e => {
    e.preventDefault();
    const [re, msg] = EMAIL_RULE[f.role];
    if (!f.name.trim()) return setErr(f.role === "company" ? "Add your company name." : "Add your full name.");
    if (!re.test(f.email.trim())) return setErr(msg);
    if (f.password.length < 8) return setErr("Use at least 8 characters for your password.");
    if (f.password !== f.confirm) return setErr("The passwords don't match.");
    if (!f.terms) return setErr("Please accept the terms of use to continue.");
    setStep(2);
  };

  const finish = e => {
    e.preventDefault();
    const pe = profileError(f);
    if (pe) return setErr(pe);
    const { confirm, terms, ...data } = f;
    const r = signup({ ...data, name: data.name.trim() });
    if (r.error) { setStep(1); return setErr(r.error); }
    nav("/", { replace: true });
  };

  const pw = strength(f.password);
  return (
    <AuthShell>
      <div className="auth-card wide">
        <ol className="steps">
          {["Account type", "Your details", "Profile"].map((s, i) => <li key={s} className={i === step ? "on" : i < step ? "done" : ""}><span className="num">{i < step ? "✓" : i + 1}</span>{s}</li>)}
        </ol>

        {step === 0 && (
          <>
            <h2>Create your account</h2>
            <p className="muted">Already have one? <Link to="/login" className="link">Sign in</Link></p>
            <div className="role-cards">
              {ROLE_CARDS.map(([r, ic, t, d]) => (
                <button key={r} className="role-card" onClick={() => pick(r)}>
                  <span className="ic"><I n={ic} s={24} /></span><b>{t}</b><span className="muted">{d}</span>
                </button>
              ))}
            </div>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 16 }}>Administrator accounts are created by existing administrators.</p>
          </>
        )}

        {step === 1 && (
          <form onSubmit={account} className="form">
            <h2>{ROLE_LABEL[f.role]} details</h2>
            {f.role !== "student" && <p className="muted" style={{ margin: 0 }}>{ROLE_LABEL[f.role]} accounts are checked by the WIL Office before they get full access.</p>}
            <label className="fld">{f.role === "company" ? "Company name" : "Full name"}<input className="input" value={f.name} onChange={e => set({ name: e.target.value })} autoFocus autoComplete={f.role === "company" ? "organization" : "name"} /></label>
            <label className="fld">Email<input className="input" type="email" value={f.email} onChange={e => set({ email: e.target.value })} placeholder={EMAIL_RULE[f.role][2]} autoComplete="email" /><small className="hint">{EMAIL_RULE[f.role][1]}</small></label>
            <div className="form-grid">
              <label className="fld">Password<input className="input" type="password" value={f.password} onChange={e => set({ password: e.target.value })} autoComplete="new-password" />
                {f.password && <span className="strength" data-s={pw}><i /><i /><i /><i /><small>{["Too short", "Weak", "OK", "Good", "Strong"][pw]}</small></span>}
              </label>
              <label className="fld">Confirm password<input className="input" type="password" value={f.confirm} onChange={e => set({ confirm: e.target.value })} autoComplete="new-password" /></label>
            </div>
            <label className="fld check"><input type="checkbox" checked={f.terms} onChange={e => set({ terms: e.target.checked })} /> I agree to the UConSoft terms of use and privacy policy.</label>
            <Err>{err}</Err>
            <div className="form-actions"><button type="button" className="btn plain" onClick={() => setStep(0)}><I n="back" s={14} /> Back</button><button className="btn">Continue <I n="arrow" s={14} /></button></div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={finish} className="form">
            <h2>Set up your profile</h2>
            <p className="muted" style={{ margin: 0 }}>{f.role === "student" ? "Partners see this when your name comes up in a match. You can change it any time." : "This is what other people see on your profile. You can change it any time."}</p>
            <ProfileFields f={f} set={set} />
            <Err>{err}</Err>
            <div className="form-actions"><button type="button" className="btn plain" onClick={() => setStep(1)}><I n="back" s={14} /> Back</button><button className="btn">Create account</button></div>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
