import { Link } from "react-router-dom";
import { STAGES } from "../data.js";
import { score } from "../matching.js";
import { useCompanyOpps } from "../hooks.js";
import { useStore } from "../store.jsx";
import { Avatar, Empty, OppPicker, Section } from "../components/ui.jsx";

export default function Shortlist() {
  const { me, shortlists, userById, projects, setStage, toggleShort, flash } = useStore();
  const { mine, open, opp } = useCompanyOpps();
  const pipeline = shortlists[me.id] || {};
  const ids = Object.keys(pipeline).filter(id => userById[id]?.status === "active");
  return (
    <>
      <div className="head">
        <div><h1>Shortlist</h1><p>{ids.length} students in your pipeline. Move them through each stage as you go.</p></div>
        <OppPicker opps={open.length ? open : mine} />
      </div>
      {ids.length === 0 ? (
        <Section><Empty icon="bookmark" action={<Link className="btn" to="/students">Find students</Link>}>Your shortlist is empty. Use Shortlist on any match to save a student here.</Empty></Section>
      ) : (
        <div className="kanban">
          {STAGES.map(stage => {
            const list = ids.filter(id => pipeline[id] === stage).map(id => ({ st: userById[id], m: opp ? score(userById[id], opp, projects) : null }))
              .sort((a, b) => (b.m?.total || 0) - (a.m?.total || 0));
            return (
              <section className="col" key={stage}>
                <h3>{stage}<span className="pill num">{list.length}</span></h3>
                {list.map(({ st, m }) => (
                  <div className="card" key={st.id}>
                    <div className="r"><Avatar u={st} size="sm" /><Link to={`/u/${st.id}`} className="plain-link" style={{ fontWeight: 600 }}>{st.name}</Link>{m && <span className="num" style={{ marginLeft: "auto", color: "var(--accent-ink)", fontWeight: 600 }}>{m.total}%</span>}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{st.discipline} · {st.year}</div>
                    <div className="r">
                      <select aria-label={`Stage for ${st.name}`} value={stage} onChange={e => { setStage(st.id, e.target.value); flash(`${st.name} moved to ${e.target.value}`); }}>
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <button className="link" style={{ marginLeft: "auto" }} onClick={() => toggleShort(st.id)}>Remove</button>
                    </div>
                  </div>
                ))}
                {list.length === 0 && <div style={{ color: "var(--faint)", fontSize: 12 }}>No one here yet.</div>}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
