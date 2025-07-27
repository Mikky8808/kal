
    function togglePassword() {
      const passField = document.getElementById('password');
      const icon = document.getElementById('toggle-icon');
      if (passField.type === 'password') {
        passField.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        passField.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    }

    function validateLogin() {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      const errorMsg = document.getElementById('error-msg');
      const submitBtn = document.getElementById('submit-btn');

      if (!username || !password) {
        errorMsg.textContent = 'Please enter both Last Name and last 4 digits of Phone.';
        return false;
      }

      // Animate submitting... on the button
      let dots = 0;
      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting';
      let interval = setInterval(() => {
        dots = (dots % 3) + 1;
        submitBtn.textContent = 'Submitting' + '.'.repeat(dots);
      }, 400);

      fetch('backend.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => res.json())
      .then(data => {
        clearInterval(interval);
        if (data.success) {
          submitBtn.textContent = 'Success!';
          submitBtn.style.backgroundColor = '#16a34a';
          setTimeout(() => {
            window.location.href = '../quickview/';
          }, 1000);
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.style.backgroundColor = '';
          errorMsg.style.color = '#dc2626';
          errorMsg.textContent = data.message || 'Login failed.';
        }
      })
      .catch(err => {
        clearInterval(interval);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.backgroundColor = '';
        console.error(err);
        errorMsg.textContent = 'An error occurred. Please try again later.';
      });
      return false;
    }
  