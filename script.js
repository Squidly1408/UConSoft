// ----------------------------
// Demo user and session handling
// ----------------------------
const loggedIn = localStorage.getItem("loggedIn");
const currentUser = localStorage.getItem("username") || "Lucas"; // default demo
const userType = localStorage.getItem("userType") || "student";

if (!loggedIn || !userType) {
  window.location.href = "./auth/login.html";
}

document.getElementById("userRole").textContent =
  userType.charAt(0).toUpperCase() + userType.slice(1);

// ----------------------------
// Theme toggle
// ----------------------------
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  const theme = document.documentElement.getAttribute("data-theme");
  const newTheme = theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

(function () {
  const saved = localStorage.getItem("theme");
  const system = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  document.documentElement.setAttribute("data-theme", saved || system);
})();

// ----------------------------
// Demo database (ready for real DB later)
// ----------------------------
let users = [
  {
    username: "Lucas",
    name: "Lucas Newman",
    title: "Software Engineering (Hons)",
  },
  { username: "Alice", name: "Alice Smith", title: "Computer Science (Hons)" },
  { username: "Bob", name: "Bob Johnson", title: "Staff" },
];

let projects = [
  {
    id: "p1",
    owner: "Lucas",
    title: "Smart Car Counter (YOLOv7)",
    type: "Assignment",
    desc: "Counts vehicles with YOLOv7; tracks and tallies per class.",
    tags: ["yolov7", "opencv", "raspberry pi", "mqtt"],
    views: 27,
    likes: [],
    signOffRequested: "Staff",
    signedOffBy: [],
    activity: [],
  },
  {
    id: "p2",
    owner: "Alice",
    title: "Industry Safety Monitor",
    type: "WIL Project",
    desc: "Pico LiPo muscle sensing + motor control; uploads metrics.",
    tags: ["pico", "embedded", "flask"],
    views: 12,
    likes: [],
    signOffRequested: "Company",
    signedOffBy: [],
    activity: [],
  },
  {
    id: "p3",
    owner: "Lucas",
    title: "Flutter USB Macro Keyboard",
    type: "Personal",
    desc: "Android app sends keystrokes to Windows via USB HID.",
    tags: ["flutter", "usb", "android"],
    views: 58,
    likes: [],
    signOffRequested: "",
    signedOffBy: [],
    activity: [],
  },
];

let activityFeed = []; // global activity array

let peopleYouMayKnow = ["Alice", "Bob"]; // demo data

function escapeHtml(str) {
  return (str + "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[
        m
      ])
  );
}
function fmt(n) {
  return new Intl.NumberFormat().format(n);
}

// ----------------------------
// Render Projects
// ----------------------------
function renderProjects(filter = "") {
  const wrap = document.getElementById("projects");
  wrap.innerHTML = "";

  projects
    .filter(
      (p) =>
        !filter ||
        [p.title, p.type, p.desc, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(filter.toLowerCase())
    )
    .forEach((p) => {
      const el = document.createElement("div");
      el.className = "project";
      el.dataset.id = p.id;

      const liked = p.likes.includes(currentUser);
      const canEdit = p.owner === currentUser;
      const canSignOff =
        p.signOffRequested &&
        !p.signedOffBy.includes(currentUser) &&
        ["Staff", "Company", "Admin"].includes(userType);

      el.innerHTML = `
      <div class="cover"><span>${escapeHtml(p.title)}</span></div>
      <div class="body">
        <div class="pill">${p.type}</div>
        <div>${escapeHtml(p.desc)}</div>
        <div>${p.tags
          .map((t) => `<span class="pill">#${escapeHtml(t)}</span>`)
          .join("")}</div>
        <div class="meta">${fmt(p.views)} views · <span class="likes">${fmt(
        p.likes.length
      )}</span> likes</div>
      <div class="pill username" onclick="viewProfile('john')">${p.owner}</div>
        <div style="margin-top:6px;">
          ${canEdit ? '<button class="btn editBtn">Edit</button>' : ""}
          <button class="btn likeBtn">${liked ? "Unlike" : "Like"}</button>
          ${
            canSignOff ? `<button class="btn signOffBtn">Sign Off</button>` : ""
          }
        </div>
      </div>
    `;
      wrap.appendChild(el);

      // Edit button
      if (canEdit) {
        el.querySelector(".editBtn").addEventListener("click", () =>
          openProjectModal(p.id)
        );
      }

      // Like button
      el.querySelector(".likeBtn").addEventListener("click", () => {
        const idx = p.likes.indexOf(currentUser);
        if (idx === -1) p.likes.push(currentUser);
        else p.likes.splice(idx, 1);
        p.activity.push({
          type: "like",
          user: currentUser,
          timestamp: new Date(),
        });
        logActivity(
          `${currentUser} ${idx === -1 ? "liked" : "unliked"} project "${
            p.title
          }"`
        );
        renderProjects(filter);
      });

      // Sign-off button
      if (canSignOff) {
        el.querySelector(".signOffBtn").addEventListener("click", () => {
          p.signedOffBy.push(currentUser);
          p.activity.push({
            type: "signoff",
            user: currentUser,
            timestamp: new Date(),
          });
          logActivity(`${currentUser} signed off project "${p.title}"`);
          renderProjects(filter);
        });
      }
    });

  // Update stats
  document.getElementById("statViews").textContent = projects.reduce(
    (a, b) => a + b.views,
    0
  );
  document.getElementById("statSignoffs").textContent = projects.reduce(
    (a, b) => a + b.signedOffBy.length,
    0
  );
  document.getElementById("statProjects").textContent = projects.length;
}

// ----------------------------
// Recent Activity
// ----------------------------
function logActivity(msg) {
  const timestamp = new Date().toLocaleString();
  activityFeed.unshift({ msg, timestamp });
  renderActivity();
}

function renderActivity() {
  const wrap = document.getElementById("activity");
  wrap.innerHTML = "";
  activityFeed.slice(0, 20).forEach((a) => {
    const el = document.createElement("div");
    el.textContent = `[${a.timestamp}] ${a.msg}`;
    wrap.appendChild(el);
  });
}

// ----------------------------
// People you may know
// ----------------------------
function renderPeople() {
  const wrap = document.getElementById("people");
  wrap.innerHTML = "";
  peopleYouMayKnow.forEach((u) => {
    const user = users.find((x) => x.username === u);
    if (user) {
      const el = document.createElement("div");
      el.textContent = `${user.name} — ${user.title}`;
      wrap.appendChild(el);
    }
  });
}

// ----------------------------
// Profile details live
// ----------------------------
function renderProfile() {
  const profileUser = users.find((u) => u.username === currentUser);
  document.querySelector(".profile .row div:nth-child(2) div").textContent =
    profileUser.name;
  document.getElementById("profileTitle").textContent = profileUser.title;
}

// ----------------------------
// Search functionality
// ----------------------------
document
  .getElementById("search")
  .addEventListener("input", (e) => renderProjects(e.target.value));

// ----------------------------
// Sidebar buttons
// ----------------------------
if (userType === "admin") {
  document.getElementById("adminBtn").style.display = "block";
}
if (userType === "company") {
  document.getElementById("companyBtn").style.display = "block";
}
if (userType === "staff") {
  document.getElementById("staffBtn").style.display = "block";
}

// ----------------------------
// Sidebar navigation
// ----------------------------
const tabs = document.querySelectorAll(".nav button");
const profileSection = document.querySelector(".profile");
const projectsSection = document.querySelector(".columns .card");

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    // main section
    if (btn.dataset.view === "feed") {
      profileSection.style.display =
        btn.dataset.view === "feed" ? "block" : "none";
      projectsSection.style.display =
        btn.dataset.view === "feed" ? "block" : "none";
    }
    // profile section
    if (btn.dataset.view === "my-profile") {
      profileSection.style.display =
        btn.dataset.view === "my-profile" ? "block" : "none";
      projectsSection.style.display =
        btn.dataset.view === "my-profile" ? "none" : "block";
    }
    // discover section
    if (btn.dataset.view === "discover") {
      profileSection.style.display =
        btn.dataset.view === "discover" ? "none" : "block";
      projectsSection.style.display =
        btn.dataset.view === "discover" ? "block" : "none";
      
    }
    // settings section
    if (btn.dataset.view === "settings") {
      profileSection.style.display =
        btn.dataset.view === "settings" ? "block" : "none";
      projectsSection.style.display =
        btn.dataset.view === "settings" ? "block" : "none";
    }
    // staff panel section
    if (btn.dataset.view === "staff-panel") {
      profileSection.style.display =
        btn.dataset.view === "staff-panel" ? "block" : "none";
      projectsSection.style.display =
        btn.dataset.view === "staff-panel" ? "block" : "none";
    }
    // company panel section
    if (btn.dataset.view === "company-panel") {
      profileSection.style.display =
        btn.dataset.view === "company-panel" ? "block" : "none";
      projectsSection.style.display =
        btn.dataset.view === "company-panel" ? "block" : "none";
    }
    // admin panel
    if (btn.dataset.view === "admin-panel") {
      profileSection.style.display =
        btn.dataset.view === "admin-panel" ? "block" : "none";
      projectsSection.style.display =
        btn.dataset.view === "admin-panel" ? "block" : "none";
    }
  });
});

// ----------------------------
// Sign out
// ----------------------------
document.getElementById("signinBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "./auth/login.html";
});

// ----------------------------
// Profile modal
// ----------------------------
const profileModal = document.getElementById("profileModal");
document
  .getElementById("editProfileBtn")
  .addEventListener("click", () => profileModal.showModal());

document.getElementById("profileForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const profileUser = users.find((u) => u.username === currentUser);
  profileUser.name = form.name.value;
  profileUser.title = form.title.value;
  renderProfile();
  logActivity(`${currentUser} updated profile`);
  profileModal.close();
});

// ----------------------------
// Project modal (Create / Edit)
// ----------------------------
const projectModal = document.getElementById("projectModal");
const projectForm = document.getElementById("projectForm");
let editingProjectId = null;

document
  .getElementById("newProjectBtn")
  .addEventListener("click", () => openProjectModal());

function openProjectModal(id = null) {
  editingProjectId = id;
  projectModal.showModal();
  if (id) {
    const p = projects.find((pr) => pr.id === id);
    if (p.owner !== currentUser)
      return alert("Cannot edit other people's projects");
    projectForm.title.value = p.title;
    projectForm.ptype.value = p.type;
    projectForm.desc.value = p.desc;
    projectForm.tags.value = p.tags.join(",");
    projectForm.signoff.value = p.signOffRequested || "";
    document.getElementById("pmTitle").textContent = "Edit Project";
  } else {
    projectForm.reset();
    document.getElementById("pmTitle").textContent = "New Project";
  }
}

projectForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    title: projectForm.title.value,
    type: projectForm.ptype.value,
    desc: projectForm.desc.value,
    tags: projectForm.tags.value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t),
    views: 0,
    likes: [],
    signedOffBy: [],
    signOffRequested: projectForm.signoff.value || "",
    owner: currentUser,
    activity: [],
  };

  if (editingProjectId) {
    const idx = projects.findIndex((p) => p.id === editingProjectId);
    projects[idx] = { ...projects[idx], ...data };
    logActivity(`${currentUser} edited project "${data.title}"`);
  } else {
    data.id = "p" + (projects.length + 1);
    projects.push(data);
    logActivity(`${currentUser} created project "${data.title}"`);
  }

  projectModal.close();
  renderProjects(document.getElementById("search").value);
});

// ----------------------------
// Initial render
// ----------------------------
renderProfile();
renderProjects();
renderActivity();
renderPeople();
