    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const fullName = document.getElementById('fullName').value;

      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
      } else if(res.status === 400) {
        alert("Password must be at least must characters, contain only English letters and numbers, and not be only digits. \n Full name should be without nubmers.");
      } else if(res.status === 409) {
            alert("User already exists");    
      } else {
            alert('Registration failed');
        }
    });