// Check token expiration periodically
function checkTokenExpiration() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000; // current time in seconds
            if (payload.exp < currentTime) {
                console.log('Token expired, logging out...');
                handleLogout();
            }
        } catch (e) {
            console.error('Error decoding token:', e);
            handleLogout(); // Log out if token is malformed
        }
    }
}

// Add logout functionality
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('user'); // Also clear user data if present
    alert('Session expired. Please log in again.');
    window.location.href = 'LoginPage.html';
}

// Start periodic token check immediately
checkTokenExpiration();
setInterval(checkTokenExpiration, 5000); // Check every 5 seconds

// Nav active link
document.addEventListener('DOMContentLoaded', async () => {
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const mainNav = document.getElementById('mainNav');

  // Toggle navigation on hamburger click
  if (hamburgerMenu && mainNav) {
    hamburgerMenu.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }

  // Handle navigation link clicks (for both desktop and mobile)
  document.querySelectorAll('#mainNav a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // If it's the Home link, allow default navigation
      if (href === 'HomePage.html') {
        // No preventDefault, allow browser to navigate
        return;
      }

      e.preventDefault(); // Prevent default link behavior for other internal links

      // Remove active class from all links
      document.querySelectorAll('#mainNav a').forEach(l => l.classList.remove('active'));
      // Add active class to clicked link
      link.classList.add('active');
      
      // Hide the navigation menu on link click (for mobile/hamburger view)
      if (mainNav) {
        mainNav.classList.remove('active');
      }

      // Show/hide sections based on clicked link
      const sectionId = href.substring(1); // Get section ID from href (e.g., #dashboard -> dashboard)
      document.querySelectorAll('main section').forEach(section => {
          section.style.display = 'none';
      });
      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
          targetSection.style.display = 'block';
      }

      // Reload data for the active section if needed (e.g., if switching back and forth)
      if (sectionId === 'dashboard') loadDashboardStats();
      if (sectionId === 'users') loadUsers();
      if (sectionId === 'admins') loadAdmins();
      if (sectionId === 'inventory') loadCars();
      if (sectionId === 'messages') loadMessages();
    });
  });

  // Initial data load and authentication check
  const token = checkAuth();
  if (token) {
      await loadAdminProfile();
      await loadDashboardStats();
      await loadUsers();
      await loadAdmins();
      await loadCars();
      await loadMessages();
  } else {
      console.log('No token found, checkAuth redirected to login or handled.');
  }

  // Initially show the dashboard section
  const initialSection = document.getElementById('dashboard');
  if (initialSection) {
      initialSection.style.display = 'block';
  }
});

// User actions
document.getElementById('usersTable').addEventListener('click', async e => {
  const target = e.target;
  const row = target.closest('tr');
  if (!row) return;
  const userId = row.dataset.id;

  if (target.matches('.delete-user')) {
    if (confirm('Are you sure you want to delete this user?')) {
      const result = await apiRequest(`/api/v1/users/${userId}`, 'DELETE');
      if (result && result.success) {
        alert('User deleted successfully!');
        await loadUsers(); // Refresh the user list from the database
        await loadDashboardStats(); // Update dashboard stats if user count changes
      }
    }
  } else if (target.matches('.edit-user')) {
    // Fetch current user data to populate prompts
    const currentUserData = await apiRequest(`/api/v1/users/${userId}`);
    if (!currentUserData || !currentUserData.user) {
        alert('Failed to fetch user details for editing.');
        return;
    }
    const currentUser = currentUserData.user;

    const newName = prompt('Enter new name:', currentUser.name);
    const newEmail = prompt('Enter new email:', currentUser.email);
    const newRole = prompt('Enter new role (user/admin):', currentUser.role);
    const newStatus = prompt('Enter new status (Active/Pending/Blocked):', currentUser.status);

    if (newName !== null || newEmail !== null || newRole !== null || newStatus !== null) {
        const updatedUserData = {
            name: newName !== null ? newName : currentUser.name,
            email: newEmail !== null ? newEmail : currentUser.email,
            role: newRole !== null ? newRole : currentUser.role,
            status: newStatus !== null ? newStatus : currentUser.status,
        };
        const result = await apiRequest(`/api/v1/users/${userId}`, 'PUT', updatedUserData);
        if (result && result.success) {
            alert('User updated successfully!');
            await loadUsers();
        }
    }

  } 
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'LoginPage.html';
        return;
    }
    checkTokenExpiration(); // Check expiration when token is retrieved
    return token;
}

// API request helper
async function apiRequest(url, method = 'GET', body = null) {
    console.log(`[apiRequest] Initiating ${method} request to: ${url}`); // Added log
    const token = checkAuth(); // Ensures token is present before making request
    if (!token) {
        console.log('[apiRequest] No token found, redirecting to login.'); // Added log
        return null; // If no token, checkAuth already redirected
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        console.log(`[apiRequest] Response status for ${url}: ${response.status}`); // Added log
        if (response.status === 401) {
            // Token expired or invalid, handle logout and alert
            handleLogout(); // This will show the alert and redirect
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[apiRequest] API error for ${url}:`, errorData); // Added log
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        const data = await response.json();
        console.log(`[apiRequest] Successful response for ${url}:`, data); // Added log
        return data;
    } catch (error) {
        console.error(`[apiRequest] Request to ${url} failed:`, error);
        // Only show alert if it's not a handled 401 error or other specific non-JSON error
        if (!(error instanceof SyntaxError && error.message.includes("Unexpected token"))) {
            alert(`Error: ${error.message || 'An unexpected error occurred.'}`);
        }
        return null;
    }
}

// Load cars
async function loadCars() {
    console.log('Executing loadCars...'); // Added log
    console.log('Requesting all cars...'); // Added log
    const carsData = await apiRequest('/api/v1/cars');
    if (!carsData || !carsData.cars) {
        console.log('No car data or cars array found.'); // Added log
        return;
    }

    const tbody = document.querySelector('#carsTable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    carsData.cars.forEach(car => {
        const tr = document.createElement('tr');
        tr.dataset.id = car._id;
        tr.innerHTML = `
            <td>${car._id}</td>
            <td>${car.brand}</td>
            <td>${car.model}</td>
            <td>${car.year}</td>
            <td>${car.engine || 'N/A'}</td>
            <td>${car.horsepower || 'N/A'}</td>
            <td>${car.torque || 'N/A'}</td>
            <td>${typeof car.price === 'number' ? car.price.toLocaleString() : 'N/A'}</td>
            <td>${car.status}</td>
            <td>
                <div class="action-buttons-container">
                    <button class="edit-car" data-id="${car._id}">Edit</button>
                    <button class="delete-car" data-id="${car._id}">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Add new car
document.getElementById('addCarBtn').addEventListener('click', async () => {
    const newMake = document.getElementById('newMake').value.trim();
    const newModel = document.getElementById('newModel').value.trim();
    const newYear = parseInt(document.getElementById('newYear').value);
    const newEngine = document.getElementById('newEngine').value.trim();
    const newHorsepower = parseInt(document.getElementById('newHorsepower').value);
    const newTorque = parseInt(document.getElementById('newTorque').value);
    const newPrice = parseFloat(document.getElementById('newPrice').value);
    
    const newStatus = document.getElementById('newStatus').value;

    if (!newMake || !newModel || isNaN(newYear) || !newEngine || isNaN(newHorsepower) || isNaN(newTorque) || isNaN(newPrice)) {
        alert('Please fill in all required car fields correctly.');
        return;
    }

    const carData = {
        brand: newMake,
        model: newModel,
        year: newYear,
        engine: newEngine,
        horsepower: newHorsepower,
        torque: newTorque,
        price: newPrice,
        status: newStatus,
        images: [] // Assuming images will be handled separately or added later
    };

    const result = await apiRequest('/api/v1/cars', 'POST', carData);

    if (result && result.success) {
        alert('Car added successfully!');
        document.getElementById('addCarForm').reset(); // Reset the form
        await loadCars(); // Reload the car list
        await loadDashboardStats(); // Update dashboard stats
    } else {
        alert('Failed to add car.');
    }
});

// Car actions
document.getElementById('carsTable').addEventListener('click', async e => {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;
    const carId = row.dataset.id;

    if (target.matches('.delete-car')) {
        if (confirm('Are you sure you want to delete this car?')) {
            const result = await apiRequest(`/api/v1/cars/${carId}`, 'DELETE');
            if (result && result.success) {
                alert('Car deleted successfully!');
                await loadCars();
                await loadDashboardStats();
            } else {
                alert('Failed to delete car.');
            }
        }
    } else if (target.matches('.edit-car')) {
        // Fetch current car data to populate prompts
        const currentCarData = await apiRequest(`/api/v1/cars/${carId}`);
        if (!currentCarData || !currentCarData.car) {
            alert('Failed to fetch car details for editing.');
            return;
        }
        const currentCar = currentCarData.car;

        const newMake = prompt('Enter new brand:', currentCar.brand);
        const newModel = prompt('Enter new model:', currentCar.model);
        const newYear = prompt('Enter new year:', currentCar.year);
        const newEngine = prompt('Enter new engine:', currentCar.engine);
        const newHorsepower = prompt('Enter new horsepower:', currentCar.horsepower);
        const newTorque = prompt('Enter new torque:', currentCar.torque);
        const newPrice = prompt('Enter new price:', currentCar.price);
        const newStatus = prompt('Enter new status (Available/Sold):', currentCar.status);

        if (newMake !== null || newModel !== null || newYear !== null || newEngine !== null || newHorsepower !== null || newTorque !== null || newPrice !== null || newStatus !== null) {
            const updatedCarData = {
                brand: newMake !== null ? newMake : currentCar.brand,
                model: newModel !== null ? newModel : currentCar.model,
                year: newYear !== null ? parseInt(newYear) : currentCar.year,
                engine: newEngine !== null ? newEngine : currentCar.engine,
                horsepower: newHorsepower !== null ? parseInt(newHorsepower) : currentCar.horsepower,
                torque: newTorque !== null ? parseInt(newTorque) : currentCar.torque,
                price: newPrice !== null ? parseFloat(newPrice) : currentCar.price,
                status: newStatus !== null ? newStatus : currentCar.status,
            };
            const result = await apiRequest(`/api/v1/cars/${carId}`, 'PUT', updatedCarData);
            if (result && result.success) {
                alert('Car updated successfully!');
                await loadCars();
            } else {
                alert('Failed to update car.');
            }
        }
    }
});

// Messages actions
document.getElementById('messagesTable').addEventListener('click', async e => {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;
    const messageId = row.dataset.id;

    if (target.matches('.view-message')) {
        // Fetch message details and display in a modal or new view
        const messageDetails = await apiRequest(`/api/v1/messages/${messageId}`);
        if (messageDetails && messageDetails.message) {
            alert(`Message from: ${messageDetails.message.fromName} (${messageDetails.message.fromEmail})\nSubject: ${messageDetails.message.subject}\n\n${messageDetails.message.messageBody}`);
            // Optionally mark as read after viewing
            await apiRequest(`/api/v1/messages/${messageId}/markRead`, 'PUT');
            await loadMessages(); // Refresh messages list
            await loadDashboardStats(); // Update dashboard stats
        } else {
            alert('Failed to fetch message details.');
        }
    } else if (target.matches('.delete-message')) {
        if (confirm('Are you sure you want to delete this message?')) {
            const result = await apiRequest(`/api/v1/messages/${messageId}`, 'DELETE');
            if (result && result.success) {
                alert('Message deleted successfully!');
                await loadMessages();
                await loadDashboardStats();
            } else {
                alert('Failed to delete message.');
            }
        }
    }
});

// Load admin profile
async function loadAdminProfile() {
    try {
        // Get admin data from localStorage
        const adminData = localStorage.getItem('admin');
        if (!adminData) {
            console.error('Admin data not found in local storage.');
            return;
        }

        const admin = JSON.parse(adminData);
        console.log('[loadAdminProfile] Parsed admin data from localStorage:', admin);

        if (!admin || (!admin._id && !admin.id)) {
            console.error('Invalid admin data in local storage: Missing _id or id.');
            return;
        }

        const response = await apiRequest(`/api/v1/admins/profile`);
        if (response && response.admin) {
            document.getElementById('welcomeAdminHeader').textContent = `Welcome, ${response.admin.name}`;
        } else {
            console.error('Failed to load admin profile from server.');
        }
    } catch (error) {
        console.error('Error fetching admin profile:', error);
    }
}

// Load users
async function loadUsers() {
    const usersData = await apiRequest('/api/v1/users');
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    if (usersData && usersData.users) {
        usersData.users.forEach(user => {
            const tr = document.createElement('tr');
            tr.dataset.id = user._id;
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.status}</td>
                <td>
                    <div class="action-buttons-container">
                        <button class="edit-user" data-id="${user._id}">Edit</button>
                        <button class="delete-user" data-id="${user._id}">Delete</button>
                        
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Load admins
async function loadAdmins() {
    const adminsData = await apiRequest('/api/v1/admins');
    const tbody = document.querySelector('#adminsTable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    if (adminsData && adminsData.admins) {
        adminsData.admins.forEach(admin => {
            const tr = document.createElement('tr');
            tr.dataset.id = admin._id;
            tr.innerHTML = `
                <td>${admin.name}</td>
                <td>${admin.email}</td>
                <td>${admin.role}</td>
                <td>
                    <div class="action-buttons-container">
                        <button class="edit-admin" data-id="${admin._id}">Edit</button>
                        <button class="delete-admin" data-id="${admin._id}">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Load messages
async function loadMessages() {
    const messagesData = await apiRequest('/api/v1/messages');
    const tbody = document.querySelector('#messagesTable tbody');
    tbody.innerHTML = '';

    if (messagesData && messagesData.messages) {
        messagesData.messages.forEach(message => {
            const tr = document.createElement('tr');
            tr.dataset.id = message._id;
            tr.innerHTML = `
                <td>${new Date(message.createdAt).toLocaleDateString()}</td>
                <td>${message.fromName}</td>
                <td>${message.subject}</td>
                <td><span class="badge-${message.read ? 'read' : 'unread'}">${message.read ? 'Read' : 'Unread'}</span></td>
                <td>
                    <div class="action-buttons-container">
                        <button class="view-message" data-id="${message._id}">View</button>
                        <button class="delete-message" data-id="${message._id}">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Logout
document.querySelector('#mainNav ul li.logout a').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default link behavior
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    window.location.href = 'LoginPage.html';
});

// Update message count in dashboard
function updateMessageCount() {
  const unreadCount = document.querySelectorAll('.badge-unread').length;
  document.getElementById('card-messages').textContent = unreadCount;
}

// Dashboard counter animation
document.addEventListener('DOMContentLoaded', () => {
    // Function to get actual counts from tables
    const getCounts = () => {
        const userCount = document.querySelectorAll('#usersTable tbody tr').length;
        const carCount = document.querySelectorAll('#carsTable tbody tr').length;
        const unreadCount = document.querySelectorAll('.badge-unread').length;

        return {
            'card-users': userCount,
            'card-cars': carCount,
            'card-messages': unreadCount
        };
    };

    // Function to animate counting
    const animateCounter = (elementId, finalValue) => {
        const element = document.getElementById(elementId);
        let currentValue = 0;
        const duration = 1000;
        const steps = 50;
        const increment = finalValue / steps;
        const stepTime = duration / steps;

        const updateCounter = () => {
            currentValue = Math.min(currentValue + increment, finalValue);
            element.textContent = Math.round(currentValue);

            if (currentValue < finalValue) {
                setTimeout(updateCounter, stepTime);
            }
        };

        updateCounter();
    };

     // Initialize all counters
    const counters = getCounts();
    Object.entries(counters).forEach(([id, value]) => {
        animateCounter(id, value);
    });

    // Update counters dynamically
    window.updateDashboardCounters = () => {
        const newCounts = getCounts();
        Object.entries(newCounts).forEach(([id, value]) => {
            animateCounter(id, value);
        });
    };

    // Observe table changes
    const observeTableChanges = () => {
        const tables = ['usersTable', 'carsTable', 'messagesTable'];
        tables.forEach(tableId => {
            const table = document.getElementById(tableId);
            if (table) {
                new MutationObserver(() => {
                    updateDashboardCounters();
                }).observe(table, { childList: true, subtree: true });
            }
        });
    };

    observeTableChanges();
});

// Load dashboard overview statistics
async function loadDashboardStats() {
    try {
        // Get users count
        const usersData = await apiRequest('/api/v1/users');
        if (usersData && usersData.users) {
            document.getElementById('card-users').textContent = usersData.users.length;
        }

        // Get admins count
        const adminsData = await apiRequest('/api/v1/admins');
        if (adminsData && adminsData.admins) {
            document.getElementById('card-admins').textContent = adminsData.admins.length;
        }

        // Get cars count
        const carsData = await apiRequest('/api/v1/cars');
        if (carsData && carsData.cars) {
            document.getElementById('card-cars').textContent = carsData.cars.length;
        }

        // Get unread messages count
        const messagesData = await apiRequest('/api/v1/messages');
        if (messagesData && messagesData.messages) {
            const unreadCount = messagesData.messages.filter(msg => !msg.read).length;
            document.getElementById('card-messages').textContent = unreadCount;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Admin actions
document.getElementById('adminsTable').addEventListener('click', async e => {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;
    const adminId = row.dataset.id;

    if (target.matches('.delete-admin')) {
        if (confirm('Are you sure you want to delete this admin?')) {
            const result = await apiRequest(`/api/v1/admins/${adminId}`, 'DELETE');
            if (result && result.success) {
                alert('Admin deleted successfully!');
                await loadAdmins(); // Refresh the admin list
                await loadDashboardStats(); // Update dashboard stats
            }
        }
    } else if (target.matches('.edit-admin')) {
        const currentAdminData = await apiRequest(`/api/v1/admins/${adminId}`);
        if (!currentAdminData || !currentAdminData.admin) {
            alert('Failed to fetch admin details for editing.');
            return;
        }
        const currentAdmin = currentAdminData.admin;

        const newName = prompt('Enter new name:', currentAdmin.name);
        const newEmail = prompt('Enter new email:', currentAdmin.email);
        const newRole = prompt('Enter new role (admin/super_admin):', currentAdmin.role);

        if (newName !== null || newEmail !== null || newRole !== null) {
            const updatedAdminData = {
                name: newName !== null ? newName : currentAdmin.name,
                email: newEmail !== null ? newEmail : currentAdmin.email,
                role: newRole !== null ? newRole : currentAdmin.role,
            };
            const result = await apiRequest(`/api/v1/admins/${adminId}`, 'PUT', updatedAdminData);
            if (result && result.success) {
                alert('Admin updated successfully!');
                await loadAdmins();
            }
        }
    }
});

// Toggle password visibility function
function togglePasswordVisibility(inputElementId, toggleElementId) {
    const input = document.getElementById(inputElementId);
    const toggle = document.getElementById(toggleElementId);
    if (input && toggle) {
        toggle.addEventListener("click", () => {
            const type = input.getAttribute("type") === "password" ? "text" : "password";
            input.setAttribute("type", type);
            toggle.textContent = type === "password" ? "👁" : "🙈";
        });
    }
}

// Apply toggle to new admin password fields
togglePasswordVisibility('newAdminPassword', 'toggleNewAdminPassword');
togglePasswordVisibility('newAdminConfirmPassword', 'toggleNewAdminConfirmPassword');

// Add new admin
document.getElementById('addAdminBtn').addEventListener('click', async () => {
    const newAdminName = document.getElementById('newAdminName').value.trim();
    const newAdminEmail = document.getElementById('newAdminEmail').value.trim();
    const newAdminPassword = document.getElementById('newAdminPassword').value.trim();
    const newAdminConfirmPassword = document.getElementById('newAdminConfirmPassword').value.trim();
    const newAdminRole = document.getElementById('newAdminRole').value;

    if (!newAdminName || !newAdminEmail || !newAdminPassword || !newAdminConfirmPassword || !newAdminRole) {
        alert('Please fill in all required admin fields.');
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newAdminEmail)) {
        alert('Please enter a valid email address for the admin.');
        return;
    }

    if (newAdminPassword !== newAdminConfirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const adminData = {
        name: newAdminName,
        email: newAdminEmail,
        password: newAdminPassword,
        role: newAdminRole
    };

    const result = await apiRequest('/api/v1/admins/register', 'POST', adminData);

    if (result && result.success) {
        alert('Admin added successfully!');
        document.getElementById('addAdminForm').reset(); // Reset the form
        // Reset toggle icons after form reset (optional, but good for consistency)
        document.getElementById('toggleNewAdminPassword').textContent = '👁';
        document.getElementById('toggleNewAdminConfirmPassword').textContent = '👁';
        await loadAdmins(); // Reload the admin list
        await loadDashboardStats(); // Update dashboard stats
    } else {
        alert(result.message || 'Failed to add admin.');
    }
});

// Password toggle functionality for Admin Dashboard
$(document).ready(function () {
  $(".password-toggle-fa").click(function() {
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