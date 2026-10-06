import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { StoreProvider, useStore } from "./store.jsx";
import Layout from "./components/Layout.jsx";
import { Login, Signup } from "./pages/Auth.jsx";
import Landing from "./pages/Landing.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import Discover from "./pages/Discover.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import { Opportunities, OpportunityDetail } from "./pages/Opportunities.jsx";
import Applications from "./pages/Applications.jsx";
import SignOffs from "./pages/SignOffs.jsx";
import People from "./pages/People.jsx";
import FindStudents from "./pages/FindStudents.jsx";
import Shortlist from "./pages/Shortlist.jsx";
import Reports from "./pages/Reports.jsx";
import Messages from "./pages/Messages.jsx";
import { AdminActivity, AdminContent, AdminUsers } from "./pages/Admin.jsx";

/** Sends signed-out visitors to the login page, and wrong-role users home. */
function Guard({ roles, children }) {
  const { me } = useStore();
  const loc = useLocation();
  if (!me) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  if (roles && !roles.includes(me.role)) return <Navigate to="/" replace />;
  return children;
}

const g = (el, roles) => <Guard roles={roles}>{el}</Guard>;

function HomeOrLanding() {
  const { me } = useStore();
  return me ? <Home /> : <Landing />;
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route element={<Layout />}>
            <Route index element={<HomeOrLanding />} />
            {/* public: portfolios and projects can be shared with anyone */}
            <Route path="u/:id" element={<Profile />} />
            <Route path="work/:id" element={<ProjectDetail />} />

            <Route path="settings" element={g(<Settings />)} />
            <Route path="discover" element={g(<Discover />)} />
            <Route path="people" element={g(<People />)} />
            <Route path="messages" element={g(<Messages />)} />
            <Route path="opportunities" element={g(<Opportunities />)} />
            <Route path="opportunities/:id" element={g(<OpportunityDetail />)} />

            <Route path="portfolio" element={g(<Portfolio />, ["student"])} />
            <Route path="applications" element={g(<Applications />, ["student"])} />
            <Route path="signoffs" element={g(<SignOffs />, ["staff", "company"])} />
            <Route path="students" element={g(<FindStudents />, ["company"])} />
            <Route path="shortlist" element={g(<Shortlist />, ["company"])} />
            <Route path="reports" element={g(<Reports />, ["company"])} />
            <Route path="admin/users" element={g(<AdminUsers />, ["admin"])} />
            <Route path="admin/content" element={g(<AdminContent />, ["admin"])} />
            <Route path="admin/activity" element={g(<AdminActivity />, ["admin"])} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
