import { Link } from "react-router-dom";
import { useStore } from "../store.jsx";
import { I, WorkCard } from "../components/ui.jsx";

const ROLES = [
  ["user", "Students", "Publish coursework, capstones and side projects. Ask staff to sign them off, then apply for placements that fit your skills."],
  ["shield", "University staff", "Verify student work with one click so industry partners know it's real, and keep an eye on placements."],
  ["building", "Industry partners", "Post WIL opportunities and see students ranked by skills, project evidence, course and availability."],
];

export default function Landing() {
  const { users, projects, opps } = useStore();
  const featured = projects.filter(p => !p.hidden && p.signOff?.status === "approved").sort((a, b) => b.views - a.views).slice(0, 3);
  const stats = [
    [users.filter(u => u.role === "student" && u.status === "active").length, "students"],
    [projects.filter(p => !p.hidden).length, "projects"],
    [users.filter(u => u.role === "company" && u.status === "active").length, "industry partners"],
    [opps.filter(o => o.status === "Open").length, "open opportunities"],
  ];
  return (
    <div className="landing">
      <section className="hero">
        <div>
          <span className="eyebrow">University of Newcastle · Work Integrated Learning</span>
          <h1>Show what you've built.<br />Get matched with industry.</h1>
          <p>UConSoft is a portfolio and placement network for UON students, staff and industry partners. Student work is verified by staff, and partners see who fits their roles and why.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn lg" to="/signup">Create a free account <I n="arrow" s={16} /></Link>
            <Link className="btn lg plain" to="/login">Sign in</Link>
          </div>
        </div>
        <div className="hero-stats">
          {stats.map(([n, l]) => <div key={l}><b className="num">{n}</b><span>{l}</span></div>)}
        </div>
      </section>

      <section className="role-grid">
        {ROLES.map(([ic, t, d]) => (
          <div key={t} className="panel"><span className="ic-badge"><I n={ic} s={22} /></span><h2>{t}</h2><p className="muted">{d}</p></div>
        ))}
      </section>

      <section>
        <div className="panel-h"><h2 style={{ fontSize: 26 }}>Verified student work</h2><Link to="/login" className="link">Sign in to see more <I n="arrow" s={14} /></Link></div>
        <div className="works">{featured.map(p => <WorkCard key={p.id} p={p} />)}</div>
      </section>
    </div>
  );
}
