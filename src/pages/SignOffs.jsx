import { useState } from "react";
import { Link } from "react-router-dom";
import { ago } from "../format.js";
import { useStore } from "../store.jsx";
import { DecideSignOff } from "../components/forms.jsx";
import { Avatar, Empty, I, Section, Status, Tabs, Thumb } from "../components/ui.jsx";

export default function SignOffs() {
  const { me, projects, userById } = useStore();
  const [tab, setTab] = useState("pending");
  const [review, setReview] = useState(null);
  const mine = projects.filter(p => p.signOff?.approver === me.id);
  const pending = mine.filter(p => p.signOff.status === "requested").sort((a, b) => a.signOff.at - b.signOff.at);
  const done = mine.filter(p => p.signOff.status !== "requested").sort((a, b) => b.signOff.at - a.signOff.at);
  const list = tab === "pending" ? pending : done;
  const locked = me.status !== "active";

  return (
    <>
      <div className="head"><div><h1>Sign-offs</h1><p>Students ask you to confirm their projects are genuine. Approved projects get a verified badge.</p></div></div>
      <Tabs tabs={[["pending", "Waiting", pending.length], ["done", "Decided", done.length]]} value={tab} onChange={setTab} />
      <Section>
        {list.length === 0 && <Empty icon="check">{tab === "pending" ? "Nothing waiting for you." : "You haven't decided any requests yet."}</Empty>}
        {list.map(p => {
          const st = userById[p.owner];
          return (
            <div key={p.id} className="prow">
              <Link to={`/work/${p.id}`} className="prow-thumb" aria-label={p.title}><Thumb kind={p.kind} hue={st?.hue ?? 200} /></Link>
              <div style={{ minWidth: 0 }}>
                <Link to={`/work/${p.id}`} className="plain-link"><b>{p.title}</b></Link>
                <div className="meta" style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <Avatar u={st} size="sm" /><Link to={`/u/${st?.id}`} className="plain-link">{st?.name}</Link> · {p.type}{p.course ? ` · ${p.course}` : ""} · {tab === "pending" ? "asked" : "decided"} {ago(p.signOff.at)}
                </div>
                <p className="muted" style={{ margin: "6px 0 0", fontSize: 13 }}>{p.desc}</p>
                {p.signOff.note && <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>Note: “{p.signOff.note}”</div>}
                {tab === "done" && p.signOff.comment && <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>Your comment: “{p.signOff.comment}”</div>}
              </div>
              <div className="prow-acts">
                {tab === "pending" ? <button className="btn" disabled={locked} title={locked ? "Available once your account is verified" : undefined} onClick={() => setReview(p)}><I n="shield" s={15} /> Review</button> : <Status s={p.signOff.status} />}
              </div>
            </div>
          );
        })}
      </Section>
      {review && <DecideSignOff p={review} onClose={() => setReview(null)} />}
    </>
  );
}
