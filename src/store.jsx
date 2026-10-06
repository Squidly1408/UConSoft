import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DISCIPLINES, INDUSTRIES, ROLE_LABEL, SCHOOLS, seed } from "./data.js";

// Everything lives in one state object saved to localStorage. Bump VERSION when the shape changes.
const KEY = "uconsoft-state";
const VERSION = 2;
const fresh = () => ({ version: VERSION, ...seed(), session: null, oppId: null, theme: "system" });

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.version === VERSION) return s;
  } catch {}
  return fresh();
}

export const uid = p => p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/** Fields every account of a role is expected to have, so views never meet undefined. */
export function defaultsFor(role) {
  switch (role) {
    case "student": return { degree: "", discipline: DISCIPLINES[0], year: "First year", avail: "", honours: false, gpa: null, skills: [], interests: [], openTo: [], links: {}, views: 0, bio: "" };
    case "staff": return { title: "", school: SCHOOLS[0], bio: "" };
    case "company": return { contact: "", industry: INDUSTRIES[0], size: "", website: "", bio: "" };
    default: return { title: "", bio: "" };
  }
}

const upd = (arr, id, patch) => arr.map(x => (x.id === id ? { ...x, ...(typeof patch === "function" ? patch(x) : patch) } : x));
const nm = (s, id) => s.users.find(u => u.id === id)?.name || "Someone";
const addLog = (s, actor, text) => ({ ...s, log: [{ id: uid("l"), at: Date.now(), actor, text }, ...s.log].slice(0, 400) });
const addNotif = (s, to, text, link) => (to ? { ...s, notifs: [{ id: uid("n"), to, text, link, at: Date.now(), read: false }, ...s.notifs] } : s);
const admins = s => s.users.filter(u => u.role === "admin" && u.status === "active").map(u => u.id);
const omitKey = (obj, k) => { const o = { ...obj }; delete o[k]; return o; };

export const threadUnread = (t, me) => t.items.some(m => m.from !== me && m.at > (t.read?.[me] || 0));

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const ref = useRef(state);
  ref.current = state;
  const [toast, setToast] = useState("");
  const timer = useRef();

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }, [state]);
  useEffect(() => {
    const r = document.documentElement;
    if (state.theme === "system") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  const api = useMemo(() => {
    const set = setState;
    const get = () => ref.current;
    const me = () => get().session?.uid;
    const flash = t => { setToast(t); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 2600); };

    return {
      flash,

      /* ---------- accounts ---------- */
      login(email, password) {
        const u = get().users.find(x => x.email.toLowerCase() === email.trim().toLowerCase());
        if (!u || u.password !== password) return { error: "That email and password don't match an account." };
        if (u.status === "suspended") return { error: "This account is suspended. Contact the WIL Office at wil@newcastle.edu.au." };
        set(s => ({ ...s, session: { uid: u.id }, oppId: null }));
        return { user: u };
      },
      loginAs(id) { set(s => ({ ...s, session: { uid: id }, oppId: null })); },
      logout() { set(s => ({ ...s, session: null, oppId: null })); },

      signup(data) {
        const email = data.email.trim();
        if (get().users.some(u => u.email.toLowerCase() === email.toLowerCase())) return { error: "An account with this email already exists. Sign in instead." };
        const id = uid(data.role.slice(0, 2));
        const status = data.role === "student" ? "active" : "pending";
        const user = { ...defaultsFor(data.role), hue: Math.floor(Math.random() * 360), location: "Newcastle NSW", ...data, email, id, status, createdAt: Date.now() };
        set(s => {
          let n = { ...s, users: [...s.users, user], session: { uid: id } };
          n = addLog(n, id, `${user.name} created a ${ROLE_LABEL[user.role].toLowerCase()} account${status === "pending" ? " (pending approval)" : ""}`);
          for (const a of admins(s)) if (status === "pending") n = addNotif(n, a, `${user.name} registered as ${ROLE_LABEL[user.role].toLowerCase()} and is waiting for approval.`, "/admin/users?status=pending");
          return addNotif(n, id, status === "pending"
            ? "Welcome to UConSoft. An administrator will verify your account shortly. You can finish your profile in the meantime."
            : "Welcome to UConSoft. Add a project to your portfolio so industry partners can see your work.", status === "pending" ? "/settings" : "/portfolio");
        });
        return { user };
      },

      /** Edit any account's profile fields. Returns { error } if the new email is taken. */
      updateUser(id, patch) {
        const s0 = get();
        if (patch.email && s0.users.some(u => u.id !== id && u.email.toLowerCase() === patch.email.trim().toLowerCase())) return { error: "Another account already uses that email." };
        set(s => {
          const by = s.session?.uid;
          let n = { ...s, users: upd(s.users, id, u => (patch.role && patch.role !== u.role ? { ...defaultsFor(patch.role), ...patch } : patch)) };
          return addLog(n, by, by === id ? `${nm(s, id)} updated their profile` : `${nm(s, by)} edited ${nm(s, id)}'s account`);
        });
        return {};
      },
      changePassword(current, next) {
        const u = get().users.find(x => x.id === me());
        if (!u || u.password !== current) return { error: "Your current password is not correct." };
        set(s => addLog({ ...s, users: upd(s.users, u.id, { password: next }) }, u.id, `${u.name} changed their password`));
        return {};
      },
      setStatus(id, status) {
        set(s => {
          const by = s.session?.uid, name = nm(s, id), was = s.users.find(u => u.id === id)?.status;
          let n = { ...s, users: upd(s.users, id, { status }) };
          const verb = status === "active" ? (was === "pending" ? "approved" : "reactivated") : status === "suspended" ? "suspended" : "set to pending";
          n = addLog(n, by, `${nm(s, by)} ${verb} ${name}`);
          if (status === "active") n = addNotif(n, id, was === "pending" ? "Your account has been verified. You now have full access." : "Your account has been reactivated.", "/");
          return n;
        });
      },
      createUser(data) {
        if (get().users.some(u => u.email.toLowerCase() === data.email.trim().toLowerCase())) return { error: "An account with this email already exists." };
        const id = uid(data.role.slice(0, 2));
        set(s => addLog({ ...s, users: [...s.users, { ...defaultsFor(data.role), hue: Math.floor(Math.random() * 360), location: "Newcastle NSW", status: "active", createdAt: Date.now(), ...data, id }] },
          s.session?.uid, `${nm(s, s.session?.uid)} created ${ROLE_LABEL[data.role].toLowerCase()} account ${data.name}`));
        return { id };
      },
      deleteUser(id) {
        set(s => {
          const by = s.session?.uid, name = nm(s, id);
          const goneOpps = new Set(s.opps.filter(o => o.company === id).map(o => o.id));
          const shortlists = Object.fromEntries(Object.entries(omitKey(s.shortlists, id)).map(([k, v]) => [k, omitKey(v, id)]));
          const notes = Object.fromEntries(Object.entries(omitKey(s.notes, id)).map(([k, v]) => [k, omitKey(v, id)]));
          const n = {
            ...s,
            users: s.users.filter(u => u.id !== id),
            projects: s.projects.filter(p => p.owner !== id).map(p => (p.signOff?.approver === id && p.signOff.status === "requested" ? { ...p, signOff: null } : p)),
            opps: s.opps.filter(o => o.company !== id),
            applications: s.applications.filter(a => a.student !== id && !goneOpps.has(a.opp)),
            threads: s.threads.filter(t => !t.members.includes(id)),
            notifs: s.notifs.filter(x => x.to !== id),
            shortlists, notes,
            session: by === id ? null : s.session,
          };
          return addLog(n, by === id ? null : by, by === id ? `${name} deleted their account` : `${nm(s, by)} deleted the account of ${name}`);
        });
      },
      viewProfile(id) {
        if (id === me()) return;
        set(s => ({ ...s, users: upd(s.users, id, u => (u.role === "student" ? { views: (u.views || 0) + 1 } : {})) }));
      },

      /* ---------- projects & sign-offs ---------- */
      saveProject(p) {
        const id = p.id || uid("w");
        set(s => {
          const exists = s.projects.some(x => x.id === id);
          const by = s.session?.uid;
          const projects = exists ? upd(s.projects, id, p)
            : [{ views: 0, likes: [], signOff: null, hidden: false, flagged: false, createdAt: Date.now(), owner: by, ...p, id }, ...s.projects];
          return addLog({ ...s, projects }, by, `${nm(s, by)} ${exists ? "updated" : "published"} ${p.title}`);
        });
        return id;
      },
      deleteProject(id) {
        set(s => {
          const p = s.projects.find(x => x.id === id), by = s.session?.uid;
          let n = { ...s, projects: s.projects.filter(x => x.id !== id) };
          if (p && p.owner !== by) n = addNotif(n, p.owner, `An administrator removed your project ${p.title}.`, "/portfolio");
          return addLog(n, by, `${nm(s, by)} deleted ${p?.title || "a project"}`);
        });
      },
      requestSignOff(id, approver, note) {
        set(s => {
          const p = s.projects.find(x => x.id === id), by = s.session?.uid;
          let n = { ...s, projects: upd(s.projects, id, { signOff: { status: "requested", approver, note, at: Date.now(), comment: "" } }) };
          n = addNotif(n, approver, `${nm(s, by)} asked you to sign off ${p.title}.`, "/signoffs");
          return addLog(n, by, `${nm(s, by)} requested sign-off on ${p.title} from ${nm(s, approver)}`);
        });
      },
      cancelSignOff(id) { set(s => ({ ...s, projects: upd(s.projects, id, { signOff: null }) })); },
      decideSignOff(id, status, comment) {
        set(s => {
          const p = s.projects.find(x => x.id === id), by = s.session?.uid;
          let n = { ...s, projects: upd(s.projects, id, x => ({ signOff: { ...x.signOff, status, comment, at: Date.now() } })) };
          const what = status === "approved" ? "signed off" : "asked for changes on";
          n = addNotif(n, p.owner, `${nm(s, by)} ${what} ${p.title}.`, `/work/${id}`);
          return addLog(n, by, `${nm(s, by)} ${what} ${p.title}`);
        });
      },
      toggleLike(id) {
        set(s => {
          const by = s.session?.uid;
          return { ...s, projects: upd(s.projects, id, p => ({ likes: p.likes.includes(by) ? p.likes.filter(x => x !== by) : [...p.likes, by] })) };
        });
      },
      viewProject(id) { set(s => ({ ...s, projects: upd(s.projects, id, p => ({ views: p.views + 1 })) })); },
      reportProject(id, reason) {
        set(s => {
          const p = s.projects.find(x => x.id === id), by = s.session?.uid;
          let n = { ...s, projects: upd(s.projects, id, { flagged: true, flagReason: reason }) };
          for (const a of admins(s)) n = addNotif(n, a, `${nm(s, by)} reported ${p.title}: ${reason}`, "/admin/content");
          return addLog(n, by, `${nm(s, by)} reported ${p.title}`);
        });
      },
      moderateProject(id, patch) {
        set(s => {
          const p = s.projects.find(x => x.id === id), by = s.session?.uid;
          let n = { ...s, projects: upd(s.projects, id, patch) };
          let text = null;
          if (patch.hidden === true) { text = "hid"; n = addNotif(n, p.owner, `${p.title} was hidden by a moderator. Contact the WIL Office for details.`, `/work/${id}`); }
          if (patch.hidden === false) { text = "restored"; n = addNotif(n, p.owner, `${p.title} is visible again.`, `/work/${id}`); }
          if (patch.flagged === false) text = text || "cleared the report on";
          return text ? addLog(n, by, `${nm(s, by)} ${text} ${p.title}`) : n;
        });
      },

      /* ---------- opportunities & applications ---------- */
      saveOpp(o) {
        const id = o.id || uid("o");
        set(s => {
          const exists = s.opps.some(x => x.id === id), by = s.session?.uid;
          const opps = exists ? upd(s.opps, id, o) : [...s.opps, { status: "Open", createdAt: Date.now(), company: by, ...o, id }];
          return addLog({ ...s, opps, oppId: exists ? s.oppId : id }, by, `${nm(s, by)} ${exists ? "updated" : "posted"} ${o.title}`);
        });
        return id;
      },
      toggleOpp(id) {
        set(s => {
          const o = s.opps.find(x => x.id === id), by = s.session?.uid, status = o.status === "Open" ? "Closed" : "Open";
          return addLog({ ...s, opps: upd(s.opps, id, { status }) }, by, `${nm(s, by)} ${status === "Open" ? "reopened" : "closed"} ${o.title}`);
        });
      },
      deleteOpp(id) {
        set(s => {
          const o = s.opps.find(x => x.id === id), by = s.session?.uid;
          return addLog({ ...s, opps: s.opps.filter(x => x.id !== id), applications: s.applications.filter(a => a.opp !== id) }, by, `${nm(s, by)} deleted ${o?.title}`);
        });
      },
      apply(oppId, cover) {
        set(s => {
          const by = s.session?.uid, o = s.opps.find(x => x.id === oppId);
          if (s.applications.some(a => a.opp === oppId && a.student === by && a.status !== "Withdrawn")) return s;
          const prior = s.applications.find(a => a.opp === oppId && a.student === by);
          const applications = prior
            ? upd(s.applications, prior.id, { status: "Submitted", cover, at: Date.now(), updatedAt: Date.now() })
            : [...s.applications, { id: uid("a"), opp: oppId, student: by, status: "Submitted", cover, at: Date.now(), updatedAt: Date.now() }];
          let n = addNotif({ ...s, applications }, o.company, `${nm(s, by)} applied for ${o.title}.`, `/opportunities/${oppId}`);
          return addLog(n, by, `${nm(s, by)} applied for ${o.title}`);
        });
      },
      withdraw(appId) {
        set(s => {
          const a = s.applications.find(x => x.id === appId), o = s.opps.find(x => x.id === a.opp);
          let n = { ...s, applications: upd(s.applications, appId, { status: "Withdrawn", updatedAt: Date.now() }) };
          n = addNotif(n, o?.company, `${nm(s, a.student)} withdrew their application for ${o?.title}.`, `/opportunities/${a.opp}`);
          return addLog(n, a.student, `${nm(s, a.student)} withdrew from ${o?.title}`);
        });
      },
      setAppStatus(appId, status) {
        set(s => {
          const a = s.applications.find(x => x.id === appId), o = s.opps.find(x => x.id === a.opp), by = s.session?.uid;
          let n = { ...s, applications: upd(s.applications, appId, { status, updatedAt: Date.now() }) };
          n = addNotif(n, a.student, `${nm(s, o.company)} moved your ${o.title} application to ${status}.`, "/applications");
          return addLog(n, by, `${nm(s, by)} moved ${nm(s, a.student)} to ${status} for ${o.title}`);
        });
      },

      /* ---------- company tools ---------- */
      pickOpp(id) { set(s => ({ ...s, oppId: id })); },
      toggleShort(studentId) {
        const s0 = get(), by = me(), on = !!s0.shortlists[by]?.[studentId];
        flash(on ? `Removed ${nm(s0, studentId)} from shortlist` : `Added ${nm(s0, studentId)} to shortlist`);
        set(s => {
          const mine = { ...(s.shortlists[by] || {}) };
          if (mine[studentId]) delete mine[studentId]; else mine[studentId] = "Shortlisted";
          return { ...s, shortlists: { ...s.shortlists, [by]: mine } };
        });
      },
      setStage(studentId, stage) {
        set(s => { const by = s.session?.uid; return { ...s, shortlists: { ...s.shortlists, [by]: { ...(s.shortlists[by] || {}), [studentId]: stage } } }; });
      },
      setNote(studentId, text) {
        set(s => { const by = s.session?.uid; return { ...s, notes: { ...s.notes, [by]: { ...(s.notes[by] || {}), [studentId]: text } } }; });
      },

      /* ---------- messages & notifications ---------- */
      /** Returns the id of the thread between the current user and `other`, creating it if needed. */
      startThread(other, subject = "New conversation") {
        const by = me();
        const found = get().threads.find(t => t.members.includes(by) && t.members.includes(other));
        if (found) return found.id;
        const id = uid("t");
        set(s => ({ ...s, threads: [{ id, members: [by, other], subject, read: { [by]: Date.now() }, items: [] }, ...s.threads] }));
        return id;
      },
      send(threadId, text) {
        set(s => {
          const by = s.session?.uid, at = Date.now();
          return { ...s, threads: upd(s.threads, threadId, t => ({ items: [...t.items, { from: by, text, at }], read: { ...t.read, [by]: at } })) };
        });
      },
      readThread(threadId) {
        set(s => ({ ...s, threads: upd(s.threads, threadId, t => ({ read: { ...t.read, [s.session?.uid]: Date.now() } })) }));
      },
      readNotif(id) { set(s => ({ ...s, notifs: upd(s.notifs, id, { read: true }) })); },
      readAllNotifs() { set(s => ({ ...s, notifs: s.notifs.map(n => (n.to === s.session?.uid ? { ...n, read: true } : n)) })); },

      /* ---------- app ---------- */
      setTheme(theme) { set(s => ({ ...s, theme })); },
      reset() {
        set(s => {
          const f = fresh();
          const keep = s.session && f.users.some(u => u.id === s.session.uid);
          return { ...f, theme: s.theme, session: keep ? s.session : null };
        });
        flash("Demo data restored");
      },
    };
  }, []);

  const me = state.session ? state.users.find(u => u.id === state.session.uid) || null : null;
  const myId = me?.id;
  const value = useMemo(() => {
    const unreadMsgs = myId ? state.threads.filter(t => t.members.includes(myId) && threadUnread(t, myId)).length : 0;
    const myNotifs = myId ? state.notifs.filter(n => n.to === myId).sort((a, b) => b.at - a.at) : [];
    const userById = Object.fromEntries(state.users.map(u => [u.id, u]));
    return { ...state, ...api, me, userById, unreadMsgs, myNotifs, unreadNotifs: myNotifs.filter(n => !n.read).length, toast };
  }, [state, api, me, myId, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
