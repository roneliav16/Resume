document.addEventListener('DOMContentLoaded', async () => {
  try {
      const res = await fetch('/api/users/status', {
        method: 'GET',
        credentials: 'include'
      });

    const data = await res.json();

    if (data.loggedIn) {
        if (data.isAdminLoggedIn) {
          document.getElementById('manageBtn').style.display = 'inline-block';
        } else{
           document.getElementById('manageBtn').style.display = 'none';
        }

        document.getElementById('userChangesBtn').style.display = 'inline-block';
        document.getElementById('loginButton').innerHTML = "🔐Change User";
        document.getElementById('logoutBtn').style.display = 'inline-block';

        const welcomeBanner = document.createElement('div');
        welcomeBanner.className = 'welcome-banner';

        const welcomeText = document.createElement('span');
        welcomeText.textContent = `👋 Hello, ${data.fullName}!`;
        welcomeBanner.appendChild(welcomeText);
        document.body.appendChild(welcomeBanner);
    } else {
        document.getElementById('loginButton').innerHTML = "🔐Login";
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('userChangesBtn').style.display = 'none';
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