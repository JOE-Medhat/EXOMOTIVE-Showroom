const carsGridContainer = document.getElementById('carsGridContainer');

// Load cars on page load and handle filter buttons
document.addEventListener('DOMContentLoaded', async () => {
  await loadCars();

  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(button => {
    button.addEventListener("click", async () => {
      // toggle active button
      document.querySelector(".filter-btn.active").classList.remove("active");
      button.classList.add("active");

      const category = button.dataset.category;
      await loadCars(category === 'all' ? {} : { brand: category }); // Pass brand filter to loadCars
    });
  });
});

// Load cars with optional filters
async function loadCars(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`http://localhost:3000/api/v1/cars?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }
    const data = await response.json();
    if (data.success) {
      // Get default image
      const defaultImageResponse = await fetch('http://localhost:3000/api/v1/default-image');
      const defaultImageData = await defaultImageResponse.json();
      const defaultImage = defaultImageData.success ? defaultImageData.defaultImage : '/images/Audi/Cars/R8 V10 Performance Front.png';
      
      displayCars(data.cars, defaultImage);
    } else {
      showError('Failed to load cars');
    }
  } catch (error) {
    showError('An error occurred while loading cars: ' + error.message);
  }
}

// Display cars in the container
function displayCars(cars, defaultImage) {
  carsGridContainer.innerHTML = '';
  
  if (cars.length === 0) {
    carsGridContainer.innerHTML = '<p class="no-cars">No cars found matching your criteria</p>';
    return;
  }

  cars.forEach(car => {
    console.log('Car object received by frontend:', car); // Keep this for now for debugging
    const carCard = createCarCard(car, defaultImage);
    carsGridContainer.appendChild(carCard);
  });
}

// Create car card element
function createCarCard(car, defaultImage) {
  const card = document.createElement('div');
  card.className = 'car-card';
  card.setAttribute('data-category', car.brand);
  card.onclick = () => viewCarDetails(car._id);
  
  // Use noBgImages[0] if it exists, otherwise images[0], then default
  let imageUrl = defaultImage;
  if (car.noBgImages && car.noBgImages.length > 0 && car.noBgImages[0]) {
    imageUrl = car.noBgImages[0];
  } else if (car.images && car.images.length > 0 && car.images[0]) {
    imageUrl = car.images[0];
  }

  card.innerHTML = `
    <h3 class="car-brand">${car.brand}</h3>
    <h4 class="car-model">${car.model}</h4>
    <div class="car-image">
      <img src="${encodeURI(imageUrl.replace(/^"+|"+$/g, ''))}" alt="${car.brand} ${car.model}">
    </div>
  `;
  return card;
}

// View car details: now passes only car ID
function viewCarDetails(carId) {
  window.location.href = `car-details.html?id=${carId}`;
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  carsGridContainer.innerHTML = '';
  carsGridContainer.appendChild(errorDiv);
}