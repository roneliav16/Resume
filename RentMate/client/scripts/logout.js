document.addEventListener('DOMContentLoaded', async () => {
  try {
      const res = await fetch('/api/users/status', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await res.json();
      if (data.loggedIn) {
        document.getElementById('logoutBtn').style.display = 'inline-block';
        const welcomeBanner = document.createElement('div');
        welcomeBanner.className = 'welcome-banner';

        const welcomeText = document.createElement('span');
        welcomeText.textContent = `👋 Hello, ${data.fullName}!`;
        welcomeBanner.appendChild(welcomeText);
        document.body.appendChild(welcomeBanner);
      } else {
        document.getElementById('logoutBtn').style.display = 'none';
      }
    } catch (err) {
      console.error('Error checking login status:', err);
    }

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Logged out successfully');
        window.location.href = '/login.html';
      } else {
        const errorText = await response.text();
        alert('Logout failed: ' + errorText);
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Error during logout');
    }
  });
});