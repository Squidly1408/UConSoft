import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ROLE_LABEL } from "../data.js";
import { ago } from "../format.js";
import { threadUnread, useStore } from "../store.jsx";
import { Avatar, Empty, I, Modal, RolePill } from "../components/ui.jsx";

export default function Messages() {
  const { me, threads, userById, send, readThread, unreadMsgs } = useStore();
  const [params, setParams] = useSearchParams();
  const mine = threads.filter(t => t.members.includes(me.id))
    .sort((a, b) => (b.items.at(-1)?.at || 0) - (a.items.at(-1)?.at || 0));
  const activeId = params.get("t") || (window.innerWidth > 760 ? mine[0]?.id : null);
  const t = mine.find(x => x.id === activeId);
  const other = t && userById[t.members.find(m => m !== me.id)];
  const [text, setText] = useState("");
  const [composing, setComposing] = useState(false);
  const end = useRef();

  useEffect(() => {
    if (t && threadUnread(t, me.id)) readThread(t.id);
    end.current?.scrollIntoView({ block: "nearest" });
  }, [t?.id, t?.items.length]);

  const open = id => setParams({ t: id }, { replace: true });
  const submit = e => {
    e.preventDefault();
    if (!text.trim() || !t) return;
    send(t.id, text.trim());
    setText("");
  };
  const readAll = () => mine.forEach(x => threadUnread(x, me.id) && readThread(x.id));

  return (
    <>
      <div className="head">
        <div><h1>Messages</h1><p>{unreadMsgs ? `${unreadMsgs} unread` : "You're all caught up."}</p></div>
        <div className="form-actions">
          {unreadMsgs > 0 && <button className="btn plain" onClick={readAll}>Mark all as read</button>}
          <button className="btn" onClick={() => setComposing(true)} disabled={me.status !== "active"}><I n="plus" s={16} w={2.2} /> New message</button>
        </div>
      </div>
      <div className={"thread" + (t ? " has-active" : "")}>
        <section className="panel thread-list" style={{ padding: 8 }}>
          {mine.length === 0 && <Empty icon="msg">No conversations yet.</Empty>}
          {mine.map(x => {
            const o = userById[x.members.find(m => m !== me.id)];
            const unread = threadUnread(x, me.id);
            return (
              <button key={x.id} className={"msg" + (unread ? " unread" : "") + (x.id === activeId ? " on" : "")} onClick={() => open(x.id)}>
                <Avatar u={o} size="sm2" />
                <div style={{ minWidth: 0 }}><b>{o?.name || "Deleted user"}</b><p>{x.items.at(-1)?.text || x.subject}</p></div>
                <span className="when">{x.items.length ? ago(x.items.at(-1).at) : ""}{unread && <i className="ud" />}</span>
              </button>
            );
          })}
        </section>
        {t ? (
          <section className="panel thread-view">
            <div className="panel-h">
              <button className="link back-btn" onClick={() => setParams({}, { replace: true })} aria-label="Back to conversations"><I n="back" s={16} /></button>
              <Link to={`/u/${other?.id}`} className="owner" style={{ flex: 1 }}><Avatar u={other} size="sm2" /><div><b>{other?.name || "Deleted user"}</b><small>{t.subject}</small></div></Link>
              {other && <RolePill role={other.role} />}
            </div>
            <div className="bubbles">
              {t.items.length === 0 && <div className="muted">Start the conversation below.</div>}
              {t.items.map((m, i) => <div key={i} className={"bub" + (m.from === me.id ? " me" : "")}>{m.text}<div className="bub-t">{ago(m.at)}</div></div>)}
              <div ref={end} />
            </div>
            <form className="compose" onSubmit={submit}>
              <input className="input" value={text} onChange={e => setText(e.target.value)} placeholder={`Message ${other?.name || ""}`} aria-label="Message" disabled={!other || me.status !== "active"} />
              <button className="btn" disabled={!text.trim()}><I n="send" s={15} /> Send</button>
            </form>
          </section>
        ) : <section className="panel thread-view empty-view"><Empty icon="msg">Pick a conversation, or start a new one.</Empty></section>}
      </div>
      {composing && <NewMessage onClose={() => setComposing(false)} onPick={id => { setComposing(false); open(id); }} />}
    </>
  );
}

function NewMessage({ onClose, onPick }) {
  const { me, users, startThread } = useStore();
  const [q, setQ] = useState("");
  const needle = q.toLowerCase();
  const list = users.filter(u => u.id !== me.id && u.status === "active")
    .filter(u => !needle || [u.name, u.email, ROLE_LABEL[u.role]].join(" ").toLowerCase().includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name)).slice(0, 40);
  return (
    <Modal title="New message" onClose={onClose}>
      <input className="input" type="search" autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search people and companies" aria-label="Search recipients" style={{ width: "100%" }} />
      <div className="pick-list">
        {list.map(u => (
          <button key={u.id} className="pick" onClick={() => onPick(startThread(u.id))}>
            <Avatar u={u} size="sm2" /><span><b>{u.name}</b><small>{ROLE_LABEL[u.role]}{u.title ? ` · ${u.title}` : u.degree ? ` · ${u.degree}` : ""}</small></span>
          </button>
        ))}
        {list.length === 0 && <div className="muted" style={{ padding: 12 }}>No one found.</div>}
      </div>
    </Modal>
  );
}
