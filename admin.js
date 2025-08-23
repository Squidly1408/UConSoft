// --- Fake data ---
let users = [
  { id: 1, username: "alice", email: "alice@test.com", role: "user" },
  { id: 2, username: "bob", email: "bob@test.com", role: "staff" },
  { id: 3, username: "charlie", email: "charlie@test.com", role: "admin" }
];

let posts = [
  { id: 1, title: "Project One", flagged: false },
  { id: 2, title: "Project Two", flagged: true },
  { id: 3, title: "Project Three", flagged: false }
];

// --- DOM elements ---
const userList = document.getElementById("userList");
const postList = document.getElementById("postList");
const totalUsers = document.getElementById("totalUsers");
const totalPosts = document.getElementById("totalPosts");
const flaggedPosts = document.getElementById("flaggedPosts");

const editUserModal = document.getElementById("editUserModal");
let currentEditId = null;

// --- Render functions ---
function renderUsers() {
  userList.innerHTML = "";
  users.forEach(u => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";
    div.innerHTML = `
      <span>${u.username} (${u.role}) - ${u.email}</span>
      <div>
        <button class="btn small" onclick="editUser(${u.id})">Edit</button>
        <button class="btn small ghost" onclick="deleteUser(${u.id})">Delete</button>
      </div>
    `;
    userList.appendChild(div);
  });
  totalUsers.textContent = users.length;
}

function renderPosts() {
  postList.innerHTML = "";
  posts.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";
    div.innerHTML = `
      <span>${p.title} ${p.flagged ? "(Flagged)" : ""}</span>
      <button class="btn small" onclick="toggleFlag(${p.id})">
        ${p.flagged ? "Unflag" : "Flag"}
      </button>
    `;
    postList.appendChild(div);
  });
  totalPosts.textContent = posts.length;
  flaggedPosts.textContent = posts.filter(p => p.flagged).length;
}

// --- User actions ---
function editUser(id) {
  const user = users.find(u => u.id === id);
  currentEditId = id;
  document.getElementById("editUsername").value = user.username;
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editRole").value = user.role;
  editUserModal.showModal();
}

function saveUser() {
  const username = document.getElementById("editUsername").value;
  const email = document.getElementById("editEmail").value;
  const role = document.getElementById("editRole").value;
  users = users.map(u => u.id === currentEditId ? { ...u, username, email, role } : u);
  closeModal('editUserModal');
  renderUsers();
}

function deleteUser(id) {
  users = users.filter(u => u.id !== id);
  renderUsers();
}

function toggleFlag(id) {
  posts = posts.map(p => p.id === id ? { ...p, flagged: !p.flagged } : p);
  renderPosts();
}

// --- Modal ---
function closeModal(modalId) {
  document.getElementById(modalId).close();
}

// --- Event listeners ---
document.getElementById("saveUserBtn").addEventListener("click", saveUser);
document.getElementById("addUserBtn").addEventListener("click", () => {
  const newId = Date.now();
  users.push({ id: newId, username: "newuser" + newId, email: "new@test.com", role: "user" });
  renderUsers();
});

// --- Initial render ---
renderUsers();
renderPosts();
