// Theme initialization
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme");
document.documentElement.setAttribute(
  "data-theme",
  savedTheme || (prefersDark ? "dark" : "light")
);

// Theme toggle
document.querySelector(".theme-toggle").addEventListener("click", () => {
  const theme = document.documentElement.getAttribute("data-theme");
  const newTheme = theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

function SignIn(username, userType) {
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("username", username);
  localStorage.setItem("userType", userType);
  window.location.href = "../home.html";
}

// Login form handling
const form = document.getElementById("loginForm");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  let userType = null;
  if (email === "1@uon.edu.au" && password) SignIn("Lucas", "admin");
  else if (["2@uon.edu.au"].includes(email) && password)
    SignIn("WillB", "staff");
  else if (email === "3@uon.edu.au" && password) SignIn("EmmaR", "company");
  else if (email === "4@uon.edu.au" && password) SignIn("SophieL", "student");
  else {
    alert("Invalid email or password");
  }
});

// Sign out helper
function signOut() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("userType");
  window.location.href = "./auth/login.html";
}
