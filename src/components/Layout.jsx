import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ROLE_LABEL } from "../data.js";
import { ago } from "../format.js";
import { useStore } from "../store.jsx";
import { Avatar, I } from "./ui.jsx";

// [path, icon, label, badge key]
export const NAV = {
  student: [["/", "home", "Home"], ["/portfolio", "file", "My Portfolio"], ["/opportunities", "brief", "Opportunities"], ["/applications", "doc", "Applications"],
    ["/discover", "star", "Discover"], ["/people", "people", "People"], ["/messages", "msg", "Messages", "msgs"]],
  staff: [["/", "home", "Home"], ["/signoffs", "shield", "Sign-offs", "signoffs"], ["/people", "people", "Students"], ["/discover", "star", "Student Work"],
    ["/opportunities", "brief", "Opportunities"], ["/messages", "msg", "Messages", "msgs"]],
  company: [["/", "home", "Overview"], ["/students", "search", "Find Students"], ["/discover", "file", "Student Work"], ["/opportunities", "brief", "Opportunities"],
    ["/shortlist", "bookmark", "Shortlist"], ["/signoffs", "shield", "Sign-offs", "signoffs"], ["/messages", "msg", "Messages", "msgs"], ["/reports", "chart", "Reports"]],
  admin: [["/", "home", "Dashboard"], ["/admin/users", "people", "Users", "pending"], ["/admin/content", "flag", "Content", "flagged"], ["/admin/activity", "activity", "Activity log"],
    ["/discover", "star", "Student Work"], ["/opportunities", "brief", "Opportunities"], ["/messages", "msg", "Messages", "msgs"]],
};

function useOutside(ref, on, close) {
  useEffect(() => {
    if (!on) return;
    const h = e => ref.current && !ref.current.contains(e.target) && close();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [on]);
}

function Notifications() {
  const { myNotifs, unreadNotifs, readNotif, readAllNotifs } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const nav = useNavigate();
  useOutside(ref, open, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="topbtn" aria-label={`Notifications, ${unreadNotifs} unread`} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <I n="bell" s={22} />{unreadNotifs > 0 && <span className="dot num">{unreadNotifs}</span>}
      </button>
      {open && (
        <div className="pop notif-pop" role="menu">
          <div className="pop-h"><b>Notifications</b>{unreadNotifs > 0 && <button className="link" onClick={readAllNotifs}>Mark all read</button>}</div>
          {myNotifs.length === 0 && <div className="muted" style={{ padding: 16 }}>Nothing yet.</div>}
          {myNotifs.slice(0, 12).map(n => (
            <button key={n.id} className={"notif" + (n.read ? "" : " unread")} onClick={() => { readNotif(n.id); setOpen(false); if (n.link) nav(n.link); }}>
              <span className="nd" /><span>{n.text}<small>{ago(n.at)}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { me, logout, reset } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const nav = useNavigate();
  useOutside(ref, open, () => setOpen(false));
  const go = to => { setOpen(false); nav(to); };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="topbtn" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Account menu">
        <Avatar u={me} size="sm2" /><span className="nm">{me.name}</span><I n="down" s={16} />
      </button>
      {open && (
        <div className="pop" role="menu">
          <div className="pop-me"><Avatar u={me} /><div><b>{me.name}</b><small>{me.email}</small><small>{ROLE_LABEL[me.role]}</small></div></div>
          <button onClick={() => go(`/u/${me.id}`)}><I n="user" s={16} /> View my profile</button>
          <button onClick={() => go("/settings")}><I n="edit" s={16} /> Edit profile</button>
          <button onClick={() => go("/settings?tab=account")}><I n="settings" s={16} /> Account settings</button>
          <hr />
          <button onClick={() => { setOpen(false); reset(); }}><I n="activity" s={16} /> Reset demo data</button>
          <button onClick={() => { setOpen(false); logout(); nav("/"); }}><I n="logout" s={16} /> Sign out</button>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { me, toast, unreadMsgs, projects, users } = useStore();
  const [navOpen, setNavOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => { setNavOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);

  const badges = me ? {
    msgs: unreadMsgs,
    signoffs: projects.filter(p => p.signOff?.status === "requested" && p.signOff.approver === me.id).length,
    pending: me.role === "admin" ? users.filter(u => u.status === "pending").length : 0,
    flagged: me.role === "admin" ? projects.filter(p => p.flagged).length : 0,
  } : {};

  return (
    <>
      <header className="top">
        {me && <button className="topbtn menu-btn" onClick={() => setNavOpen(o => !o)} aria-label="Menu" aria-expanded={navOpen}><I n="menu" s={22} /></button>}
        <Link to="/" className="logo">UCon<span>Soft</span></Link>
        <div className="tag">Work Integrated Learning Network</div>
        <div className="sp" />
        {me ? (
          <>
            <span className="role-tag">{ROLE_LABEL[me.role]}</span>
            <Notifications />
            <UserMenu />
          </>
        ) : (
          <>
            <Link className="topbtn" to="/login">Sign in</Link>
            <Link className="btn" to="/signup">Create account</Link>
          </>
        )}
      </header>
      <div className={"shell" + (me ? "" : " public")}>
        {me && (
          <>
            <nav className={"side" + (navOpen ? " open" : "")} aria-label="Main">
              <div className="uni"><b>University of Newcastle</b><small>Connecting talent, industry and real-world impact.</small></div>
              <div className="nav">
                {NAV[me.role].map(([to, ic, l, b]) => (
                  <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "on" : "")}>
                    <I n={ic} s={20} /> {l}
                    {b && badges[b] > 0 && <span className="badge num">{badges[b]}</span>}
                  </NavLink>
                ))}
                <NavLink to="/settings" className={({ isActive }) => (isActive ? "on" : "")}><I n="settings" s={20} /> Settings</NavLink>
              </div>
              <div className="motto">REAL IDEAS.<br />BRIGHTER<br />FUTURES.<i /></div>
            </nav>
            {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}
          </>
        )}
        <main>
          {me?.status === "pending" && (
            <div className="banner"><I n="clock" s={18} /><div><b>Your account is waiting for verification.</b> An administrator will check your details soon. Until then you can edit your profile and look around, but {me.role === "company" ? "you can't post opportunities or message students" : "you can't sign off student work"}.</div></div>
          )}
          <Outlet />
        </main>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
