import { useEffect, useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DISCIPLINES, ROLE_LABEL } from "../data.js";
import { fmtMonth, initials } from "../format.js";
import { band, LABELS } from "../matching.js";
import { useStudents } from "../hooks.js";
import { useStore } from "../store.jsx";

const P = {
  home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.5-4.5",
  file: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6",
  brief: "M4 8h16v11H4zM9 8V5h6v3",
  people: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.5-3.5 3.2-6 6.5-6s6 2.5 6.5 6M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14c2 .7 3.3 2.9 3.5 6",
  msg: "M4 5h16v11H9l-5 4z",
  chart: "M5 20V10M10 20V5M15 20v-8M20 20H3",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.2v.1",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  back: "M19 12H5M11 6l-6 6 6 6",
  plus: "M12 5v14M5 12h14",
  chev: "M9 6l6 6-6 6",
  down: "M6 9l6 6 6-6",
  doc: "M7 3h7l4 4v14H7zM10 12h5M10 16h5",
  team: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 19c.4-3 2.4-5 5-5s4.6 2 5 5M16 11a3 3 0 1 0 0-6M17 14c2 .5 3.6 2.4 4 5",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.1",
  github: "M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.5-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.8 2.8 5.8 3.1 5.8 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.4 9.5c0 4.6 2.7 5.7 5.5 6-.6.5-.6 1.2-.5 2V21",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  menu: "M4 6h16M4 12h16M4 18h16",
  building: "M5 21V4h9v17M14 9h5v12M8 8h3M8 12h3M8 16h3M3 21h18",
  send: "M4 12l16-8-6 16-2-7z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6L6 18",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c.6-4 3.8-6.5 8-6.5s7.4 2.5 8 6.5",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  lock: "M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  pin: "M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  linkedin: "M5 9v11M5 5v.1M10 20v-6.5a3 3 0 0 1 6 0V20M10 9v11",
  sliders: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M16 4v4M10 10v4M18 16v4",
  activity: "M3 12h4l3-8 4 16 3-8h4",
  eyeoff: "M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.7M6.6 6.6C4 8.3 2.5 12 2.5 12S6 18.5 12 18.5c1.8 0 3.4-.5 4.8-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2",
};

export const I = ({ n, s = 18, w = 1.7 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]} /></svg>
);

/** Initials avatar. Companies get a rounded square so they read differently from people. */
export const Avatar = ({ u, size = "" }) => {
  if (!u) return <div className={"avatar " + size} style={{ background: "var(--faint)" }} aria-hidden="true">?</div>;
  return (
    <div className={"avatar " + size + (u.role === "company" ? " co" : "")} aria-hidden="true"
      style={{ background: u.role === "admin" ? "#121a22" : `linear-gradient(135deg,hsl(${u.hue} 55% 46%),hsl(${u.hue + 30} 50% 34%))` }}>
      {initials(u.name)}
    </div>
  );
};

export function Ring({ v, size = 58 }) {
  const r = size / 2 - 4, c = 2 * Math.PI * r;
  return (
    <div className="ring" role="img" aria-label={`${v}% match`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--chip)" strokeWidth="4.5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth="4.5" strokeLinecap="round"
          strokeDasharray={`${(c * v) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray .5s" }} />
      </svg>
      <span className="num" style={{ fontSize: size < 50 ? 12 : 15 }}>{v}%</span>
    </div>
  );
}

export const Bars = ({ rows, label = 130, max = 100 }) => (
  <div className="bars">
    {rows.map(([l, v]) => (
      <div className="bar" key={l} style={{ gridTemplateColumns: `${label}px 1fr 44px` }}>
        <span style={{ fontSize: label > 140 ? 12.5 : undefined }}>{l}</span>
        <div className="track"><div className="fill" style={{ width: (max ? (v / max) * 100 : 0) + "%" }} /></div>
        <span className="v num">{max === 100 ? v + "%" : v}</span>
      </div>
    ))}
  </div>
);

/* Generated project thumbnails (no external images needed) */
export function Thumb({ kind, hue }) {
  const bg = `hsl(${hue} 35% 18%)`, fg = `hsl(${hue} 70% 62%)`, soft = `hsl(${hue} 30% 28%)`;
  return (
    <svg className="thumb" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="140" fill={bg} />
      {kind === "dash" && <g>
        <rect x="20" y="16" width="280" height="110" rx="6" fill={soft} />
        <rect x="32" y="28" width="60" height="8" rx="2" fill={fg} opacity=".7" />
        {[0, 1, 2].map(i => <rect key={i} x={32 + i * 44} y="46" width="36" height="22" rx="3" fill={bg} />)}
        <polyline points="170,100 190,82 210,90 230,64 250,74 270,48 288,58" fill="none" stroke={fg} strokeWidth="2.5" />
        <polyline points="32,108 60,96 88,102 116,86 144,92" fill="none" stroke={fg} strokeWidth="2" opacity=".6" />
      </g>}
      {kind === "robot" && <g>
        <rect x="110" y="52" width="100" height="50" rx="8" fill={soft} />
        <circle cx="140" cy="77" r="15" fill={bg} stroke={fg} strokeWidth="3" />
        <circle cx="180" cy="77" r="15" fill={bg} stroke={fg} strokeWidth="3" />
        <circle cx="140" cy="77" r="5" fill={fg} /><circle cx="180" cy="77" r="5" fill={fg} />
        <rect x="155" y="30" width="10" height="22" fill={soft} />
        <circle cx="122" cy="116" r="12" fill={soft} /><circle cx="198" cy="116" r="12" fill={soft} />
      </g>}
      {kind === "app" && <g>
        <rect x="70" y="14" width="66" height="122" rx="10" fill={soft} />
        <rect x="148" y="24" width="66" height="122" rx="10" fill={soft} />
        {[0, 1, 2, 3].map(i => <rect key={i} x="78" y={32 + i * 22} width="50" height="14" rx="3" fill={bg} />)}
        <path d="M156 110 q20 -30 50 -40" stroke={fg} strokeWidth="3" fill="none" />
        <circle cx="206" cy="70" r="6" fill={fg} />
        <rect x="232" y="40" width="70" height="8" rx="2" fill={fg} opacity=".8" />
        <rect x="232" y="56" width="56" height="8" rx="2" fill={fg} opacity=".5" />
      </g>}
      {kind === "board" && <g>
        <rect x="60" y="20" width="200" height="104" rx="6" fill={`hsl(${hue} 45% 26%)`} />
        {[0, 1, 2, 3, 4].map(i => <rect key={i} x={84 + i * 30} y="40" width="18" height="18" fill={bg} />)}
        <rect x="120" y="72" width="60" height="36" fill={bg} stroke={fg} strokeWidth="1.5" />
        <path d="M80 100h40M180 90h60M150 58v14M200 58v14" stroke={fg} strokeWidth="1.5" />
      </g>}
    </svg>
  );
}

/* ---------- small building blocks ---------- */

export function Modal({ title, onClose, children, wide, footer }) {
  useEffect(() => {
    const k = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={"modal" + (wide ? " wide" : "")} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-h"><h2>{title}</h2><button type="button" className="x" onClick={onClose} aria-label="Close"><I n="x" s={20} /></button></div>
        <div className="modal-b">{children}</div>
        {footer && <div className="modal-f">{footer}</div>}
      </div>
    </div>
  );
}

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="tabs" role="tablist">
    {tabs.map(([k, l, n]) => (
      <button key={k} role="tab" aria-selected={value === k} className={value === k ? "on" : ""} onClick={() => onChange(k)}>
        {l}{n != null && <span className="num">{n}</span>}
      </button>
    ))}
  </div>
);

const TONE = {
  Open: "good", Closed: "", active: "good", pending: "warn", suspended: "bad",
  Submitted: "info", Reviewing: "info", Interview: "warn", Offer: "good", Unsuccessful: "bad", Withdrawn: "",
  approved: "good", requested: "warn", changes: "bad",
};
const STATUS_TEXT = { active: "Active", pending: "Pending approval", suspended: "Suspended", approved: "Signed off", requested: "Awaiting sign-off", changes: "Changes requested" };
export const Status = ({ s }) => <span className={"pill " + (TONE[s] || "")}>{STATUS_TEXT[s] || s}</span>;
export const RolePill = ({ role }) => <span className={"pill role-" + role}>{ROLE_LABEL[role]}</span>;

export const Empty = ({ icon = "info", children, action }) => (
  <div className="empty"><I n={icon} s={28} /><div>{children}</div>{action}</div>
);

export const Section = ({ title, action, children, className = "", style }) => (
  <section className={"panel " + className} style={style}>
    {(title || action) && <div className="panel-h"><h2>{title}</h2>{action}</div>}
    {children}
  </section>
);

export const StatCard = ({ icon, label, value, cta, to }) => {
  const body = <>
    <div className="ic"><I n={icon} s={22} /></div>
    <div className="lbl">{label}</div>
    <div className="row"><div className="big num">{value}</div>{cta && <span className="link">{cta} <I n="arrow" s={14} /></span>}</div>
  </>;
  return to ? <Link className="panel stat" to={to}>{body}</Link> : <div className="panel stat">{body}</div>;
};

/** Chip input with suggestions: type and press Enter, or pick a suggestion. */
export function TagInput({ value, onChange, suggestions = [], placeholder = "Type and press Enter", id }) {
  const [text, setText] = useState("");
  const listId = useId();
  const add = t => { const v = t.trim(); if (v && !value.some(x => x.toLowerCase() === v.toLowerCase())) onChange([...value, v]); setText(""); };
  const left = suggestions.filter(s => !value.includes(s) && s.toLowerCase().includes(text.toLowerCase())).slice(0, 12);
  return (
    <div className="taginput">
      <div className="chips" style={{ marginTop: 0 }}>
        {value.map(v => (
          <span key={v} className="chip on">{v}<button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(value.filter(x => x !== v))}><I n="x" s={12} w={2.4} /></button></span>
        ))}
      </div>
      <input id={id} className="input" value={text} placeholder={placeholder} list={listId} onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(text); }
          if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
        }} />
      {left.length > 0 && <div className="chips sugg">{left.map(s => <button type="button" key={s} className="chip" onClick={() => add(s)}>+ {s}</button>)}</div>}
    </div>
  );
}

/* ---------- domain pieces ---------- */

export function SignOffBadge({ p, compact }) {
  const { userById } = useStore();
  const so = p.signOff;
  if (!so || so.status !== "approved") return null;
  const who = userById[so.approver];
  return <span className="verified" title={`Signed off by ${who?.name || "staff"}`}><I n="shield" s={14} />{compact ? "Verified" : `Signed off by ${who?.name || "staff"}`}</span>;
}

export function WorkCard({ p }) {
  const { userById, me } = useStore();
  const st = userById[p.owner];
  if (!st) return null;
  return (
    <article className="work">
      <Link to={`/work/${p.id}`} className="thumb-link" aria-label={p.title}><Thumb kind={p.kind} hue={st.hue} /></Link>
      <div className="b">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span className="pill">{p.type}</span><SignOffBadge p={p} compact />
          {p.hidden && <span className="pill bad">Hidden</span>}
        </div>
        <h3><Link to={`/work/${p.id}`} className="plain-link">{p.title}</Link></h3>
        <Link className="byline link" style={{ color: "var(--fg)" }} to={`/u/${st.id}`}>
          <Avatar u={st} size="sm" /><b>{st.name}</b><em>{st.discipline}</em>
        </Link>
        <p>{p.desc}</p>
        <div className="chips">{p.tags.slice(0, 4).map(t => <span key={t} className="chip">{t}</span>)}</div>
        <div className="links">
          <span className="meta-ic"><I n="eye" s={14} /> {p.views}</span>
          <span className="meta-ic" style={p.likes.includes(me?.id) ? { color: "var(--accent-ink)" } : null}><I n="heart" s={14} /> {p.likes.length}</span>
          {p.team && <span className="meta-ic"><I n="team" s={14} /> Team</span>}
          {p.links?.github && <a href={p.links.github} target="_blank" rel="noopener noreferrer"><I n="github" s={14} /> Code</a>}
        </div>
      </div>
    </article>
  );
}

export function MatchRow({ st, m, rank, selected, onSelect }) {
  const { shortlists, me, toggleShort } = useStore();
  const nav = useNavigate();
  const short = !!shortlists[me.id]?.[st.id];
  return (
    <div className={"match" + (selected ? " sel" : "")} onClick={onSelect} role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onSelect?.()} aria-pressed={selected}>
      <div className="rank num">{rank}</div>
      <Avatar u={st} />
      <div className="who">
        <b>{st.name}</b>
        <div className="meta">{st.degree}</div>
        <div className="meta">{st.year} &nbsp;|&nbsp; Available {fmtMonth(st.avail)}</div>
        <div className="chips">{st.skills.slice(0, 4).map(s => <span key={s} className="chip">{s}</span>)}</div>
      </div>
      <Ring v={m.total} />
      <div className="why">
        <b>{band(m.total)}:</b> {m.matched.length ? m.matched.slice(0, 3).join(", ") : "transferable skills"}
        {m.more > 0 && <small>+{m.more} more</small>}
      </div>
      <div className="acts" onClick={e => e.stopPropagation()}>
        <button className="btn" onClick={() => nav(`/u/${st.id}`)}>View profile</button>
        <button className={"btn ghost" + (short ? " on" : "")} onClick={() => toggleShort(st.id)} aria-pressed={short}>
          <I n="bookmark" s={15} /> {short ? "Shortlisted" : "Shortlist"}
        </button>
      </div>
    </div>
  );
}

export function Breakdown({ st, m, title }) {
  return (
    <section className="panel">
      <div className="panel-h"><h2>{title || `Match breakdown — ${st.name}`}</h2>{!title && <Link className="link" to={`/u/${st.id}`}>Full profile <I n="arrow" s={14} /></Link>}</div>
      <Bars rows={Object.keys(LABELS).map(k => [LABELS[k], m.b[k]])} />
      <hr className="sep" />
      <h3 style={{ fontSize: 17, marginBottom: 12 }}>Why this match?</h3>
      <ul className="reasons">{m.reasons.map(([ic, t]) => <li key={t}><I n={ic} s={18} /><span>{t}</span></li>)}</ul>
      <div className="note"><I n="info" s={16} /> Matching supports decision-making and does not replace human review.</div>
    </section>
  );
}

export function Talent() {
  const students = useStudents();
  const rows = DISCIPLINES.map(d => [d, students.filter(s => s.discipline === d).length]);
  return (
    <section className="panel">
      <div className="panel-h"><h2>Talent by discipline</h2></div>
      <Bars rows={rows} label={170} max={Math.max(1, ...rows.map(r => r[1]))} />
    </section>
  );
}

/** Compact list of opportunities for company views. */
export function OppList({ opps, onPick, selectedId }) {
  const { applications, userById } = useStore();
  if (!opps.length) return <Empty icon="brief">No opportunities here yet.</Empty>;
  return opps.map(o => {
    const n = applications.filter(a => a.opp === o.id && a.status !== "Withdrawn").length;
    return (
      <div key={o.id} className={"opp" + (o.id === selectedId ? " sel" : "")} onClick={() => onPick(o.id)} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && onPick(o.id)}>
        <I n="building" s={22} />
        <div><b>{o.title}</b><small>{userById[o.company]?.name} · {o.mode} · <span style={{ color: o.status === "Open" ? "var(--good)" : undefined }}>{o.status}</span></small><small>{o.period}</small></div>
        <div className="n"><b className="num">{o.skills.length}</b><br />Skills</div>
        <div className="n"><b className="num">{n}</b><br />Applicants</div>
        <I n="chev" s={16} />
      </div>
    );
  });
}

export function OppPicker({ opps }) {
  const { oppId, pickOpp } = useStore();
  if (!opps.length) return null;
  const value = opps.some(o => o.id === oppId) ? oppId : opps[0].id;
  return (
    <label className="fld inline">Matching against
      <select value={value} onChange={e => pickOpp(e.target.value)}>
        {opps.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
      </select>
    </label>
  );
}

export function UserRow({ u, right, sub }) {
  return (
    <div className="urow">
      <Avatar u={u} size="sm2" />
      <div style={{ minWidth: 0 }}>
        <Link to={`/u/${u.id}`} className="plain-link"><b>{u.name}</b></Link>
        <div className="meta">{sub ?? (u.role === "student" ? u.degree || u.discipline : u.role === "company" ? u.industry : u.title)}</div>
      </div>
      {right && <div className="urow-r">{right}</div>}
    </div>
  );
}

/** How complete a profile is, with the next things to add. */
export function profileChecklist(u, projects) {
  const items = [["Write a short bio", !!u.bio?.trim()]];
  if (u.role === "student") items.push(
    ["Add your degree", !!u.degree], ["List at least 4 skills", (u.skills || []).length >= 4], ["Add interests", (u.interests || []).length > 0],
    ["Set your availability", !!u.avail], ["Add a GitHub or LinkedIn link", !!(u.links?.github || u.links?.linkedin)],
    ["Publish a project", projects.some(p => p.owner === u.id)], ["Get a project signed off", projects.some(p => p.owner === u.id && p.signOff?.status === "approved")]);
  if (u.role === "company") items.push(["Name a contact person", !!u.contact], ["Add your website", !!u.website], ["Choose a company size", !!u.size]);
  if (u.role === "staff" || u.role === "admin") items.push(["Add your title", !!u.title]);
  const done = items.filter(i => i[1]).length;
  return { items, pct: Math.round((done / items.length) * 100) };
}

export function Completeness({ u }) {
  const { projects } = useStore();
  const { items, pct } = profileChecklist(u, projects);
  if (pct === 100) return null;
  const next = items.find(i => !i[1])[0];
  return (
    <section className="panel complete">
      <div className="panel-h"><h2>Complete your profile</h2><b className="num" style={{ color: "var(--accent-ink)" }}>{pct}%</b></div>
      <div className="track" style={{ marginBottom: 14 }}><div className="fill" style={{ width: pct + "%" }} /></div>
      <ul className="checklist">
        {items.map(([t, ok]) => <li key={t} className={ok ? "ok" : ""}><I n={ok ? "check" : "plus"} s={15} w={2.2} />{t}</li>)}
      </ul>
      <Link className="btn" to={next.includes("project") ? "/portfolio" : "/settings"} style={{ marginTop: 14 }}>
        {next} <I n="arrow" s={14} />
      </Link>
    </section>
  );
}
