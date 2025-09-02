    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe').checked;

      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe })
      });

      if (res.ok) {
        window.location.href = '../index.html';
      } else if (res.status === 400) {
        alert("Username must be at least 3 characters, password must be at least 4 characters, contain only English letters and numbers, and not be only digits"); 
      } else {
        alert('Login failed');
      }
    });