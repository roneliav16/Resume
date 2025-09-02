document.addEventListener("DOMContentLoaded", async () => {
  const toggleBtn = document.getElementById("toggleThemeBtn");
  const THEME_KEY = "ui.theme"; // single localStorage key for the assignment

  const systemPref = () =>
    (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)  ? "dark"  : "light";

  const applyTheme = (mode) => {
    document.body.classList.toggle("dark-mode", mode === "dark");
    document.body.classList.toggle("light-mode", mode === "light");
    toggleBtn.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  };

  // Get login status + server theme (if logged in)
  async function getStatus() {
    try {
      const res = await fetch("/api/users/status", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      return await res.json(); // expected return: { loggedIn: boolean, mode?: "dark"|"light" }
    } catch {
      return { loggedIn: false };
    }
  }

  // Initial load logic
  async function initTheme() {
    const status = await getStatus();

    let mode;
    if (status.loggedIn) {
      // Logged-in: mirror to localStorage for persistence on the client
      mode = status.mode || localStorage.getItem(THEME_KEY) || systemPref();
    } else {
      // Guest: use localStorage only; fall back to OS preference if empty
      mode = localStorage.getItem(THEME_KEY) || systemPref();
    }

    applyTheme(mode);
    // Assignment requirement: persist/load using localStorage
    localStorage.setItem(THEME_KEY, mode);

    // Always show the toggle button (even for guests)
    toggleBtn.style.display = "inline-block";
  }

  // Click handler: flip, persist to localStorage, and (if logged in) notify server
  async function onToggle() {
    const next = document.body.classList.contains("dark-mode") ? "light" : "dark";

    // Apply for better UX
    applyTheme(next);

    localStorage.setItem(THEME_KEY, next);

    // If logged in, also persist on the server (uses your existing POST /api/users/status)
    try {
      const status = await getStatus();
      if (status.loggedIn) {
        await fetch("/api/users/status", {
          method: "POST",
          credentials: "include",
        });
      }
    } catch {
        console.error('status error:', err);
        alert('Something went wrong during checking connection to user and get status data.');
    }
  }

  await initTheme();
  toggleBtn.addEventListener("click", onToggle);

  window.addEventListener("storage", (e) => {
    if (e.key === THEME_KEY && e.newValue) {
      applyTheme(e.newValue === "dark" ? "dark" : "light");
    }
  });
});




