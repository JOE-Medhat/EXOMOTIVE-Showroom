$(document).ready(function () {
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('errorMessage');

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    signupForm.classList.add('shake');
    setTimeout(() => signupForm.classList.remove('shake'), 500);
}

// Form validation
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const isAdmin = false;

    let errors = [];

    // Name validation
    if (name.length < 2) {
        errors.push("Name must be at least 2 characters long");
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errors.push("Please enter a valid email address");
    }

    // Password validation
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    // Password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        errors.push("Password must contain uppercase, lowercase, numbers, and special characters");
    }

    // Confirm password
    if (password !== confirmPassword) {
        errors.push("Passwords do not match");
    }

    return { isValid: errors.length === 0, errors, isAdmin, formData: { name, email, password } };
}

// Form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { isValid, errors, isAdmin, formData } = validateForm();

    if (!isValid) {
        showError(errors.join('\n'));
        return;
    }

    try {
        const baseUrl = 'http://localhost:3000';
        const endpoint = '/api/v1/users/register';
        const fullUrl = `${baseUrl}${endpoint}`;
        console.log('Sending registration request to:', fullUrl);

        let requestBody = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            status: 'active'
        };

        console.log('Request body:', requestBody);

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'HomePage.html';
    } catch (error) {
        showError(error.message || 'Registration failed. Please try again.');
    }
});

// Add password toggle functionality
console.log('jQuery document ready for SignUpPage.js. Initializing password toggles.');
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
