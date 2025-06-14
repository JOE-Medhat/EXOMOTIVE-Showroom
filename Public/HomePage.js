// Scroll to top behavior
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show/hide back to top button
window.addEventListener("scroll", function () {
  const btn = document.getElementById("backToTopBtn");
  if (window.scrollY > 100) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
});


let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slider .slide');
const dots = document.querySelectorAll('.hero-slider .dot');

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  slides[index].classList.add('active');
  dots[index].classList.add('active');
  currentSlide = index; // update currentSlide so auto continues correctly
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

// Auto-slide every 3.5 seconds
let autoSlide = setInterval(nextSlide, 3500);

// Handle dot click
dots.forEach(dot => {
  dot.addEventListener('click', function() {
    clearInterval(autoSlide); // optional: reset timer after click
    let index = parseInt(this.getAttribute('data-index'));
    showSlide(index);
    autoSlide = setInterval(nextSlide, 5000); // restart auto sliding
  });
});

function goToCarDetail(car) {
  window.location.href = `car-details.html?id=${car._id}`;
}

// Function to fetch and render featured cars
async function loadFeaturedCars() {
  const featuredCarsContainer = document.getElementById('featuredCarsContainer');
  if (!featuredCarsContainer) return;

  try {
    // Removed default image fetch as it's no longer needed and caused a 404.

    const response = await fetch('http://localhost:3000/api/v1/cars'); // Fetch all cars
    if (!response.ok) {
      throw new Error('Failed to fetch featured cars');
    }
    const data = await response.json();
    const cars = data.cars; // Assuming the API returns { success: true, cars: [...] }

    // Filter for the specific featured models you want, in your desired order
    const featuredModels = [
      "911 GT2 RS",
      "M4 CSL",
      "812 Competizione",
      "Continental GT"
    ];

    // Find cars by model (case-insensitive, partial match for flexibility)
    const featured = featuredModels.map(modelName =>
      cars.find(car => car.model.toLowerCase().includes(modelName.toLowerCase()))
    ).filter(Boolean); // Remove any not found

    featuredCarsContainer.innerHTML = featured.map(car => {
      // Prioritize the first image from the car.noBgImages array
      let imageUrl = car.noBgImages && car.noBgImages.length > 0 ? car.noBgImages[0] : null;

      // If noBgImages[0] is not available, check images[0], then fallback to a static default
      if (!imageUrl) {
        if (car.images && car.images.length > 0 && car.images[0]) {
          imageUrl = car.images[0];
        } else {
          imageUrl = '/images/Audi/Cars/R8 V10 Performance Front.png'; // Static default fallback
        }
      }

      // Ensure the image path is clean by removing any extra quotes, just in case
      if (imageUrl) {
          imageUrl = imageUrl.replace(/^"|"$/g, '');
      }

      const price = typeof car.price === 'number' ? car.price.toLocaleString() : car.price;
      return `
        <a class="card" href="car-details.html?id=${car._id}">
          <h3>${car.brand}</h3>
          <p class="model">${car.model}</p>
          <img src="${encodeURI(imageUrl)}" alt="${car.brand} ${car.model}" />
          <p class="specs">${car.year} | ${car.engine} | ${car.horsepower} Hp | ${car.torque} Nm</p>
          <div class="price">${price} EGP</div>
        </a>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading featured cars:', error);
    featuredCarsContainer.innerHTML = '<p>Failed to load featured cars. Please try again later.</p>';
  }
}

// Function to update the auth button based on login status
function updateAuthButton() {
  const authButton = document.getElementById('authButton');
  const logoutButton = document.getElementById('logoutButton');
  if (!authButton || !logoutButton) return;

  const token = localStorage.getItem('token');
  let isAdmin = false;
  try {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      const admin = JSON.parse(adminData);
      if (admin && admin.role === 'admin') {
        isAdmin = true;
      }
    }
  } catch (e) {
    console.error("Error parsing admin data from localStorage:", e);
  }

  console.log('[updateAuthButton] token:', token);
  console.log('[updateAuthButton] isAdmin:', isAdmin);

  if (token) {
    if (isAdmin) {
      authButton.textContent = 'Admin Dashboard';
      authButton.href = 'AdminDashboard.html';
    } else {
      authButton.textContent = 'Profile';
      authButton.href = 'UserProfile.html';
    }
    logoutButton.style.display = 'block';
  } else {
    authButton.textContent = 'Log In';
    authButton.href = 'LoginPage.html';
    logoutButton.style.display = 'none';
  }
}

// Check token expiration periodically
function checkTokenExpiration() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000; // current time in seconds
            if (payload.exp < currentTime) {
                console.log('Token expired, logging out...');
                handleLogout(true);
            }
        } catch (e) {
            console.error('Error decoding token:', e);
            handleLogout(true); // Log out if token is malformed
        }
    }
}

// Add logout functionality
function handleLogout(isSessionExpired = false) {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    if (isSessionExpired) {
        alert('Session expired. Please log in again.');
    }
    window.location.href = 'LoginPage.html';
}

// Start periodic token check immediately
checkTokenExpiration();
setInterval(checkTokenExpiration, 5000); // Check every 5 seconds

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
  updateAuthButton();
  loadFeaturedCars(); // Load featured cars when the page loads
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => handleLogout(false));
  }
});
