import { useState } from "react";
import { Link } from "react-router-dom";
import { APP_STATUSES } from "../data.js";
import { ago } from "../format.js";
import { score } from "../matching.js";
import { useStore } from "../store.jsx";
import { Avatar, Empty, Ring, Section, Status, Tabs } from "../components/ui.jsx";

export default function Applications() {
  const { me, applications, opps, userById, projects, withdraw, flash } = useStore();
  const [tab, setTab] = useState("active");
  const mine = applications.filter(a => a.student === me.id).map(a => ({ a, o: opps.find(o => o.id === a.opp) })).filter(x => x.o)
    .sort((x, y) => y.a.updatedAt - x.a.updatedAt);
  const isActive = a => !["Withdrawn", "Unsuccessful"].includes(a.status);
  const list = mine.filter(x => (tab === "active" ? isActive(x.a) : !isActive(x.a)));

  return (
    <>
      <div className="head"><div><h1>Applications</h1><p>Track where each application is up to.</p></div><Link className="btn lg" to="/opportunities">Browse opportunities</Link></div>
      <Tabs tabs={[["active", "Active", mine.filter(x => isActive(x.a)).length], ["closed", "Past", mine.filter(x => !isActive(x.a)).length]]} value={tab} onChange={setTab} />
      <Section>
        {list.length === 0 && <Empty icon="doc" action={tab === "active" && <Link className="btn" to="/opportunities">Find an opportunity</Link>}>{tab === "active" ? "No active applications." : "Nothing here yet."}</Empty>}
        {list.map(({ a, o }) => {
          const co = userById[o.company];
          const step = APP_STATUSES.indexOf(a.status);
          return (
            <div key={a.id} className="app-row">
              <Avatar u={co} size="sm2" />
              <div style={{ minWidth: 0 }}>
                <Link to={`/opportunities/${o.id}`} className="plain-link"><b>{o.title}</b></Link>
                <div className="meta">{co?.name} · applied {ago(a.at)} · updated {ago(a.updatedAt)}</div>
                {step >= 0 && a.status !== "Unsuccessful" && (
                  <ol className="progress" aria-label={`Status: ${a.status}`}>
                    {APP_STATUSES.slice(0, 4).map((s, i) => <li key={s} className={i <= step ? "done" : ""}>{s}</li>)}
                  </ol>
                )}
              </div>
              <Ring v={score(me, o, projects).total} size={46} />
              <div className="applicant-acts">
                <Status s={a.status} />
                {isActive(a) && a.status !== "Offer" && <button className="link" onClick={() => { if (confirm("Withdraw this application?")) { withdraw(a.id); flash("Application withdrawn"); } }}>Withdraw</button>}
              </div>
            </div>
          );
        })}
      </Section>
    </>
  );
}
