// Check authentication
function checkAuth() {
    console.log('checkAuth: Checking for token and user data...');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
        console.log('checkAuth: Token or user data not found. Redirecting to LoginPage.html');
        window.location.href = 'LoginPage.html';
        return null;
    }
    
    try {
        const parsedUser = JSON.parse(userData);
        console.log('checkAuth: User data parsed successfully:', parsedUser);
        return parsedUser;
    } catch (e) {
        console.error('checkAuth: Error parsing user data from localStorage:', e);
        window.location.href = 'LoginPage.html';
        return null;
    }
}

// Secure fetch wrapper
async function secureFetch(url, options = {}) {
    console.log(`secureFetch: Making request to ${url} with method ${options.method || 'GET'}`);
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
}

// Initialize profile
async function initializeProfile() {
    const user = checkAuth();
    if (!user) {
        console.log('initializeProfile: No user object returned from checkAuth, cannot initialize profile.');
        return;
    }

    console.log('initializeProfile: User object received:', user);
    
    // Update profile header
    document.getElementById('profileName').textContent = user.name || 'User';
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileRole').textContent = user.role || 'User';
    
    // Update profile form
    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';

    // Load saved cars and messages
    await loadSavedCars();
    await loadMessages();
}

// Handle navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.profile-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const sectionId = button.dataset.section;
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Handle profile form submission
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const user = checkAuth();
    if (!user) return;

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value
    };

    try {
        const updatedUser = await secureFetch(`http://localhost:3000/api/v1/users/${user._id}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });

        localStorage.setItem('user', JSON.stringify(updatedUser.user));
        showNotification('Profile updated successfully!', 'success');
        
        // Update profile header
        document.getElementById('profileName').textContent = updatedUser.user.name;
        document.getElementById('profileEmail').textContent = updatedUser.user.email;
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification(error.message, 'error');
    }
}

// Handle password change form submission
async function handlePasswordChange(event) {
    event.preventDefault();

    const user = checkAuth();
    if (!user) return;

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        showNotification('New passwords do not match!', 'error');
        return;
    }

    try {
        await secureFetch(`http://localhost:3000/api/v1/users/${user._id}/password`, {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });

        showNotification('Password changed successfully!', 'success');
        event.target.reset();
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification(error.message, 'error');
    }
}

// Load saved cars
async function loadSavedCars() {
    const user = checkAuth();
    if (!user) return;

    try {
        const data = await secureFetch(`http://localhost:3000/api/v1/users/${user._id}/saved-cars`);
        const savedCarsGrid = document.getElementById('savedCarsGrid');

        savedCarsGrid.innerHTML = (data.cars && data.cars.length > 0)
            ? data.cars.map(car => {
                let carImage = car.images && car.images.length > 0 ? car.images[0] : null;
                if (carImage) {
                    carImage = carImage.replace(/^"|"$/g, '');
                }
                return `
                    <a class="car-card" href="car-details.html?id=${car._id}">
                        <img src="${carImage || '/images/Audi/Cars/R8 V10 Performance Front.png'}" 
                             alt="${car.brand} ${car.model}"
                             onerror="this.src='/images/Audi/Cars/R8 V10 Performance Front.png'">
                        <div class="car-card-content">
                            <h3>${car.brand} ${car.model}</h3>
                            <p>${car.year}${car.transmission ? ' | ' + car.transmission : ''}</p>
                            <p class="price">${typeof car.price === 'number' ? car.price.toLocaleString() + ' EGP' : ''}</p>
                        </div>
                    </a>`;
            }).join('')
            : '<p class="no-data">No saved cars yet.</p>';
    } catch (error) {
        console.error('Error loading saved cars:', error);
        document.getElementById('savedCarsGrid').innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}

// Load messages
async function loadMessages() {
    const user = checkAuth();
    if (!user) return;

    try {
        const data = await secureFetch(`http://localhost:3000/api/v1/messages/user/${user._id}`);
        const messagesList = document.getElementById('messagesList');

        messagesList.innerHTML = (data.messages && data.messages.length > 0)
            ? data.messages.map(message => `
                <div class="message-card">
                    <h4>${message.subject || 'No Subject'}</h4>
                    <p>${message.messageBody || 'No message content'}</p>
                    <small>Sent on: ${new Date(message.createdAt).toLocaleDateString()}</small>
                </div>`).join('')
            : '<p class="no-data">No messages yet.</p>';
    } catch (error) {
        console.error('Error loading messages:', error);
        document.getElementById('messagesList').innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Toggle password visibility
function setupPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeProfile();
    setupNavigation();
    setupPasswordToggles();
    
    // Form event listeners
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('passwordChangeForm').addEventListener('submit', handlePasswordChange);
});
