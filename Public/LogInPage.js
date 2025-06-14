$(document).ready(function () {
    const password = document.getElementById("password");
    const roleButtons = document.querySelectorAll('.role-btn');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Removed old Toggle password visibility (now handled by jQuery/Font Awesome)

    // Role selection
    roleButtons.forEach(button => {
      console.log('Setting up role button event listener for:', button.dataset.role);
      button.addEventListener('click', () => {
        console.log('Role button clicked:', button.dataset.role);
        roleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
    });

    // Show error message
    function showError(message) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
      loginForm.classList.add('shake');
      setTimeout(() => loginForm.classList.remove('shake'), 500);
    }

    // Form submission
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear existing local storage items at the start of every login attempt
      localStorage.removeItem('token');
      localStorage.removeItem('admin');

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const isAdmin = document.querySelector('.role-btn.active').dataset.role === 'admin';

      if (!email || !password) {
        showError("Please fill in all fields");
        return;
      }

      try {
        if (isAdmin) {
          console.log('Attempting admin login...');
          // Admin login
          const response = await fetch('/api/v1/admins/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });

          console.log('Response status:', response.status);
          const data = await response.json();
          console.log('Response data:', data);

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          if (!data.success) {
            throw new Error(data.message || 'Login failed');
          }

          // Store token and admin info
          localStorage.setItem('token', data.token);
          localStorage.setItem('admin', JSON.stringify({ role: 'admin', ...data.admin })); // Store role explicitly

          console.log('Login successful, redirecting to admin dashboard...');
          // Redirect to admin dashboard
          window.location.href = 'AdminDashboard.html';
        } else {
          console.log('Attempting user login...');
          // User login
          const response = await fetch('/api/v1/users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });

          console.log('Response status:', response.status);
          const data = await response.json();
          console.log('Response data:', data);

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          if (!data.success) {
            throw new Error(data.message || 'Login failed');
          }

          // Store token and user info (ensure 'admin' is explicitly false or removed)
          localStorage.setItem('token', data.token);
          localStorage.removeItem('admin'); // Explicitly remove admin flag for regular users
          localStorage.setItem('user', JSON.stringify(data.user)); // Store user data if available

          console.log('Login successful, redirecting to Home Page...');
          // Redirect to user profile page
          window.location.href = 'HomePage.html';
        }
      } catch (error) {
        console.error('Error during login:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
      }
    });

    // Check if we need to create initial admin
    async function checkInitialAdmin() {
      try {
        console.log('Checking for initial admin...');
        const response = await fetch('/api/v1/admins/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log('Initial admin check response:', data);
        
        if (data.success && data.message === 'Initial admin created successfully') {
          console.log('Initial admin created. Email: admin@exomotive.com, Password: admin123');
        }
      } catch (error) {
        console.error('Error checking initial admin:', error);
      }
    }

    // Check for initial admin when page loads
    checkInitialAdmin();

    // Password toggle functionality
    console.log('jQuery document ready for LogInPage.js. Initializing password toggles.');
    $(".password-toggle-fa").click(function() {
        console.log('Password toggle clicked!');
        const passwordInput = $("#" + $(this).data("target"));
        const type = passwordInput.attr("type");

        if (type === "password") {
            passwordInput.attr("type", "text");
            $(this).removeClass("fa-eye-slash").addClass("fa-eye");
        } else {
            passwordInput.attr("type", "password");
            $(this).removeClass("fa-eye").addClass("fa-eye-slash");
        }
    });
});