// ----------------------------
// Demo user and session handling
// ----------------------------
const loggedIn = localStorage.getItem("loggedIn");

// Get username from URL hash (website.com/#username)
let urlUser = window.location.hash.replace("#", "") || null;

// Use localStorage username if logged in, otherwise fallback to URL username
let currentUser = localStorage.getItem("username") || urlUser;

// Function to get user info from username
function getUserInfo(username) {
  return (
    users.find((u) => u.username === username) || {
      username: "Guest",
      name: "Guest",
      type: "public",
      title: "",
    }
  );
}

// Set initial user info
let userInfo = getUserInfo(currentUser);
let userType = userInfo.type;

function updateUserFromHash() {
  urlUser = window.location.hash.replace("#", "") || null;
  currentUser = localStorage.getItem("username") || urlUser;

  userInfo = getUserInfo(currentUser);
  userType = userInfo.type;

  // Example: update UI with the current user info
  document.getElementById("profileName").textContent = userInfo.name;
  document.getElementById("profileType").textContent = userInfo.type;
  document.getElementById("profileTitle").textContent = userInfo.title;

  console.log(
    "Now showing profile for:",
    userInfo.name,
    "Type:",
    userInfo.type,
    "Title:",
    userInfo.title
  );
}

if (!loggedIn || !userType) {
  notLoggedIn();
} else {
  document.getElementsByClassName("btn signIn")[0].style.display = "none";
  if (urlUser) {
    renderProjects("", urlUser, true);
  } else {
    renderProjects("", "", true);
  }
}

document.getElementById("userRole").textContent =
  userType.charAt(0).toUpperCase() + userType.slice(1);

// ----------------------------
// Non-logged in view
// ----------------------------
function notLoggedIn() {
  document.getElementsByClassName("nav")[0].style.display = "none";
  document.getElementsByClassName("btn ghost")[0].style.display = "none";
  if (urlUser) {
    renderProjects("", urlUser, true);
  } else {
    renderProjects("", "", false);
  }
}

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

function windowReload() {
  window.location.reload();
}

function viewProfile(user) {
  window.location.hash = `#${user}`;
  window.location.reload();
}

// ----------------------------
// Render Projects
// ----------------------------
function renderProjects(filter = "", username = "", Render = true) {
  if (Render) {
    const wrap = document.getElementById("projects");
    wrap.innerHTML = "";

    // filter projects
    projects
      .filter((p) => {
        // if username given, only show that user's projects
        if (username && p.owner !== username) return false;

        // otherwise check search filter
        return (
          !filter ||
          [p.title, p.type, p.desc, p.owner, ...p.tags]
            .join(" ")
            .toLowerCase()
            .includes(filter.toLowerCase())
        );
      })
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
      <div class="pill username" onclick="viewProfile('${p.owner}')">${
          p.owner
        }</div>
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
          renderProjects(filter, username, true); // keep username filter
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
            renderProjects(filter, username, true); // keep username filter
          });
        }
      });

    // Update stats (respecting username filter)
    const visibleProjects = projects.filter(
      (p) => !username || p.owner === username
    );

    document.getElementById("statViews").textContent = visibleProjects.reduce(
      (a, b) => a + b.views,
      0
    );
    document.getElementById("statSignoffs").textContent =
      visibleProjects.reduce((a, b) => a + b.signedOffBy.length, 0);
    document.getElementById("statProjects").textContent =
      visibleProjects.length;
  }
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
function renderProfile(Home, fromNavButton = false, resetHash = false) {
  let profileUsername;

  if (fromNavButton && loggedIn) {
    profileUsername = localStorage.getItem("username");

    if (resetHash) {
      history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search
      );
    }
  } else {
    const urlUser = window.location.hash.replace("#", "") || null;
    profileUsername = urlUser || currentUser;
  }

  const profileUser = users.find((u) => u.username === profileUsername) || {
    name: "Guest",
    title: "",
    type: "public",
  };

  document.querySelector(".profile .row div:nth-child(2) div").textContent =
    profileUser.name;
  document.getElementById("profileTitle").textContent = profileUser.title;
  document.getElementById("profileType").textContent = profileUser.type;
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
const settingsSection = document.querySelector(".settings");
const adminSection = document.querySelector(".admin");
const staffSection = document.querySelector(".staff");

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
      settingsSection.style.display =
        btn.dataset.view === "feed" ? "none" : "block";
      adminSection.style.display =
        btn.dataset.view === "feed" ? "none" : "block";
      staffSection.style.display =
        btn.dataset.view === "feed" ? "none" : "block";
      windowReload();
    }
    // profile section
    if (btn.dataset.view === "my-profile") {
      profileSection.style.display =
        btn.dataset.view === "my-profile" ? "block" : "none";
      projectsSection.style.display =
        btn.dataset.view === "my-profile" ? "none" : "block";
      settingsSection.style.display =
        btn.dataset.view === "my-profile" ? "none" : "block";
      adminSection.style.display =
        btn.dataset.view === "my-profile" ? "none" : "block";
      staffSection.style.display =
        btn.dataset.view === "my-profile" ? "none" : "block";
      window.location.hash = ``;
      renderProfile(false, true);
      windowReload();
    }
    // discover section
    if (btn.dataset.view === "discover") {
      profileSection.style.display =
        btn.dataset.view === "discover" ? "none" : "block";
      projectsSection.style.display =
        btn.dataset.view === "discover" ? "block" : "none";
      settingsSection.style.display =
        btn.dataset.view === "discover" ? "none" : "block";
      adminSection.style.display =
        btn.dataset.view === "discover" ? "none" : "block";
      staffSection.style.display =
        btn.dataset.view === "discover" ? "none" : "block";
      window.location.hash = ``;
      renderProfile(false, true);
      windowReload();
    }
    // settings section
    if (btn.dataset.view === "settings") {
      profileSection.style.display =
        btn.dataset.view === "settings" ? "none" : "block";
      projectsSection.style.display =
        btn.dataset.view === "settings" ? "none" : "block";
      settingsSection.style.display =
        btn.dataset.view === "settings" ? "block" : "none";
      adminSection.style.display =
        btn.dataset.view === "settings" ? "none" : "block";
      staffSection.style.display =
        btn.dataset.view === "settings" ? "none" : "block";
      window.location.hash = ``;
      renderProfile(false, true);
      windowReload();
    }
    // staff panel section
    if (btn.dataset.view === "staff-panel") {
      profileSection.style.display =
        btn.dataset.view === "staff-panel" ? "none" : "block";
      projectsSection.style.display =
        btn.dataset.view === "staff-panel" ? "none" : "block";
      settingsSection.style.display =
        btn.dataset.view === "staff-panel" ? "none" : "block";
      adminSection.style.display =
        btn.dataset.view === "staff-panel" ? "none" : "block";
      staffSection.style.display =
        btn.dataset.view === "staff-panel" ? "block" : "none";
      window.location.hash = ``;
      renderProfile(false, true);
      windowReload();
    }
    // company panel section
    if (btn.dataset.view === "company-panel") {
      profileSection.style.display =
        btn.dataset.view === "company-panel" ? "block" : "none";
      projectsSection.style.display =
        btn.dataset.view === "company-panel" ? "block" : "none";
      settingsSection.style.display =
        btn.dataset.view === "company-panel" ? "none" : "block";
      adminSection.style.display =
        btn.dataset.view === "company-panel" ? "none" : "block";
      staffSection.style.display =
        btn.dataset.view === "company-panel" ? "none" : "block";
      window.location.hash = ``;
      renderProfile(false, true);
      windowReload();
    }
    // admin panel
    if (btn.dataset.view === "admin-Panel") {
      profileSection.style.display =
        btn.dataset.view === "admin-panel" ? "block" : "none";
      projectsSection.style.display =
        btn.dataset.view === "admin-panel" ? "block" : "none";
      settingsSection.style.display =
        btn.dataset.view === "admin-panel" ? "block" : "none";
      adminSection.style.display =
        btn.dataset.view === "admin-panel" ? "none" : "block";
      staffSection.style.display =
        btn.dataset.view === "admin-panel" ? "block" : "none";
      window.location.hash = ``;
      renderProfile(false, true);
      windowReload();
    }
  });
});

// ----------------------------
// staff Dashboard functionality
// ----------------------------
// Show staff dashboard
function showStaffDashboard() {
  document
    .querySelectorAll("main > section")
    .forEach((sec) => (sec.style.display = "none"));
  document.getElementById("staffDashboard").style.display = "block";
}

// Sample data (replace with Firebase / backend)
const staffProjects = [
  { id: 1, title: "Project Alpha", submittedBy: "user123", status: "pending" },
  { id: 2, title: "Project Beta", submittedBy: "user456", status: "pending" },
];

const usersList = [
  { id: 1, username: "user123", email: "user123@email.com" },
  { id: 2, username: "user456", email: "user456@email.com" },
];

const flaggedContent = [
  { id: 1, title: "Offensive Post", reportedBy: "user789", type: "post" },
  { id: 2, title: "Spam Comment", reportedBy: "user456", type: "comment" },
];

const supportTickets = [
  {
    id: 1,
    title: "Cannot upload project",
    assignedTo: "staff1",
    status: "open",
  },
];

// Populate Staff Projects
const staffProjectsList = document.getElementById("staffProjectsList");
staffProjects.forEach((p) => {
  const div = document.createElement("div");
  div.className = "list item";
  div.innerHTML = `
        <span>${p.title} (submitted by ${p.submittedBy})</span>
        <div>
            <button class="btn small approveBtn">Approve</button>
            <button class="btn small rejectBtn">Reject</button>
        </div>
    `;
  staffProjectsList.appendChild(div);

  div.querySelector(".approveBtn").addEventListener("click", () => {
    alert(`Project "${p.title}" approved!`);
    div.remove();
  });
  div.querySelector(".rejectBtn").addEventListener("click", () => {
    alert(`Project "${p.title}" rejected!`);
    div.remove();
  });
});

// Populate User Oversight
const staffUserOversight = document.getElementById("staffUserOversight");
usersList.forEach((u) => {
  const div = document.createElement("div");
  div.className = "list item";
  div.innerHTML = `
        <span>${u.username} (${u.email})</span>
        <div>
            <button class="btn small warnBtn">Warn</button>
            <button class="btn small suspendBtn">Suspend</button>
        </div>
    `;
  staffUserOversight.appendChild(div);

  div
    .querySelector(".warnBtn")
    .addEventListener("click", () => alert(`Warned ${u.username}`));
  div
    .querySelector(".suspendBtn")
    .addEventListener("click", () => alert(`Suspended ${u.username}`));
});

// Populate Content Moderation
const staffContentModeration = document.getElementById(
  "staffContentModeration"
);
flaggedContent.forEach((c) => {
  const div = document.createElement("div");
  div.className = "list item";
  div.innerHTML = `
        <span>${c.title} (reported by ${c.reportedBy})</span>
        <div>
            <button class="btn small removeBtn">Remove</button>
            <button class="btn small ignoreBtn">Ignore</button>
        </div>
    `;
  staffContentModeration.appendChild(div);

  div.querySelector(".removeBtn").addEventListener("click", () => {
    alert(`Removed ${c.title}`);
    div.remove();
  });
  div.querySelector(".ignoreBtn").addEventListener("click", () => div.remove());
});

// Populate Support Tickets
const staffSupport = document.getElementById("staffSupport");
supportTickets.forEach((t) => {
  const div = document.createElement("div");
  div.className = "list item";
  div.innerHTML = `
        <span>${t.title} (assigned)</span>
        <div>
            <button class="btn small resolveBtn">Resolve</button>
        </div>
    `;
  staffSupport.appendChild(div);

  div.querySelector(".resolveBtn").addEventListener("click", () => {
    alert(`Ticket "${t.title}" resolved!`);
    div.remove();
  });
});

// Session Log Example
const staffSessionLog = document.getElementById("staffSessionLog");
["Login 16 Aug 2025 10:05", "Logout 16 Aug 2025 12:20"].forEach((s) => {
  const li = document.createElement("li");
  li.textContent = s;
  staffSessionLog.appendChild(li);
});

// ----------------------------
// Admin Dashboard functionality
// ----------------------------

// Only render admin panel if user is admin
if (userType === "admin") {
  const adminSection = document.getElementById("adminScreen");

  // Stats
  function renderAdminStats() {
    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("totalPosts").textContent = projects.length;
    document.getElementById("flaggedPosts").textContent = projects.filter(
      (p) => p.flagged
    ).length;
  }

  // Render users list
  function renderAdminUsers() {
    const list = document.getElementById("userList");
    if (!list) return;
    list.innerHTML = "";
    users.forEach((u, i) => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <span>${u.username} (${u.title})</span>
        <div>
          <button class="btn small" onclick="editAdminUser(${i})">Edit</button>
          <button class="btn small" onclick="deleteAdminUser(${i})">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  }

  function editAdminUser(index) {
    const user = users[index];
    const modal = document.getElementById("editUserModal");
    document.getElementById("editUsername").value = user.username;
    document.getElementById("editEmail").value = user.email || "";
    document.getElementById("editRole").value = user.userType || "user";
    modal.showModal();
    document.getElementById("saveUserBtn").onclick = () => {
      user.username = document.getElementById("editUsername").value;
      user.email = document.getElementById("editEmail").value;
      user.userType = document.getElementById("editRole").value;
      modal.close();
      renderAdminUsers();
      logActivity(`Admin edited user "${user.username}"`);
    };
  }

  function deleteAdminUser(index) {
    if (confirm("Are you sure you want to delete this user?")) {
      const removed = users.splice(index, 1);
      renderAdminUsers();
      renderAdminStats();
      logActivity(`Admin deleted user "${removed[0].username}"`);
    }
  }

  // Render posts list
  function renderAdminPosts() {
    const list = document.getElementById("postList");
    if (!list) return;
    list.innerHTML = "";
    projects.forEach((p, i) => {
      const div = document.createElement("div");
      div.className = "card";
      if (p.flagged) div.style.border = "1px solid red";
      div.innerHTML = `
        <span>${p.title} by ${p.owner}</span>
        <div>
          <button class="btn small" onclick="toggleFlagPost(${i})">${
        p.flagged ? "Unflag" : "Flag"
      }</button>
          <button class="btn small" onclick="deletePost(${i})">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  }

  function toggleFlagPost(index) {
    projects[index].flagged = !projects[index].flagged;
    renderAdminPosts();
    renderAdminStats();
    logActivity(
      `Admin ${projects[index].flagged ? "flagged" : "unflagged"} project "${
        projects[index].title
      }"`
    );
  }

  function deletePost(index) {
    if (confirm("Are you sure you want to delete this project?")) {
      const removed = projects.splice(index, 1);
      renderAdminPosts();
      renderAdminStats();
      logActivity(`Admin deleted project "${removed[0].title}"`);
    }
  }

  // Initial render for admin
  renderAdminStats();
  renderAdminUsers();
  renderAdminPosts();
}

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
  if (btn.dataset.view === "my-profile") {
  }
  renderProfile(localStorage.getItem("currentUser"), true);
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
});

// ----------------------------
// Initial render
// ----------------------------
renderProfile(currentUser);
renderActivity();
renderPeople();
updateUserFromHash();
window.addEventListener("load", updateUserFromHash);
window.addEventListener("hashchange", updateUserFromHash);
