// --- Car details rendering function (now fetches data from API) ---
async function loadCarDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id'); // Get car ID from URL

    if (!carId) {
        document.getElementById('carTitle').textContent = 'Car Not Found';
        document.getElementById('carInfo').innerHTML = '<p>No car ID provided in the URL.</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/v1/cars/${carId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch car details');
        }
        const data = await response.json();
        const car = data.car; // Assuming the API returns { success: true, car: {...} }

        if (!car) {
            document.getElementById('carTitle').textContent = 'Car Not Found';
            document.getElementById('carInfo').innerHTML = '<p>Car details could not be loaded.</p>';
            return;
        }

        // Update car title
        document.getElementById('carTitle').textContent = `${car.brand} ${car.model}`; 

        // Update car info grid
        const carInfoDiv = document.getElementById('carInfo');
        carInfoDiv.innerHTML = `
            <div class="spec-box"><strong>Year:</strong> <span>${car.year}</span></div>
            <div class="spec-box"><strong>Engine:</strong> <span>${car.engine}</span></div>
            <div class="spec-box"><strong>Horsepower:</strong> <span>${car.horsepower} Hp</span></div>
            <div class="spec-box"><strong>Torque:</strong> <span>${car.torque}</span> Nm</div>
            <div class="spec-box"><strong>Price:</strong> <span>${typeof car.price === 'number' ? car.price.toLocaleString() : 'N/A'} EGP</span></div>
            <div class="spec-box"><strong>Status:</strong> <span>${car.status}</span></div>
        `;

        // Update features list
        const featuresList = document.getElementById('carFeatures');
        featuresList.innerHTML = car.features && car.features.length > 0 
            ? car.features.map(feature => `<li>${feature}</li>`).join('')
            : '<li>No features listed.</li>';

        // Update gallery (assuming `car.images` is an array of image URLs)
        const carGallery = document.getElementById('carGallery');
        if (car.images && car.images.length > 0 ) {
            carGallery.innerHTML = `
                <div class="gallery-wrapper">
                    ${car.images
                      .slice(0, 3)
                      .map((img, index) => {
                        // Clean the image URL
                        let imageUrl = img;
                        if (imageUrl) {
                            imageUrl = imageUrl.replace(/^"|"$/g, '');
                        }

                        // If no image URL, use fallback
                        if (!imageUrl) {
                            imageUrl = '/images/Audi/Cars/R8 V10 Performance Front.png';
                        }

                        return `<img src="${encodeURI(imageUrl)}" alt="Car Image ${index + 1}" class="gallery-img ${index === 0 ? 'active' : ''}">`;
                    }).join('')}
                    ${car.images.length > 1 ? `
                        <div class="gallery-nav">
                            <button class="gallery-nav-btn left">&lt;</button>
                            <button class="gallery-nav-btn right">&gt;</button>
                        </div>
                    ` : ''}
                </div>
            `;
            setupGallery(car.images.length); // Initialize gallery navigation
        } else {
            carGallery.innerHTML = '<p>No images available.</p>';
        }
        
        // Initialize save car button
        await setupSaveCarButton(car._id);

    } catch (error) {
        console.error('Error loading car details:', error);
        document.getElementById('carTitle').textContent = 'Error Loading Car';
        document.getElementById('carInfo').innerHTML = '<p>Could not load car details. Please try again.</p>';
    }
}

// --- Gallery functionality ---
let currentGallerySlide = 0;
function setupGallery(totalSlides) {
    const galleryImgs = document.querySelectorAll('.gallery-img');
    const prevBtn = document.querySelector('.gallery-nav .left');
    const nextBtn = document.querySelector('.gallery-nav .right');

    function showGallerySlide(index) {
        galleryImgs.forEach(img => img.classList.remove('active'));
        if (galleryImgs[index]) {
            galleryImgs[index].classList.add('active');
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentGallerySlide = (currentGallerySlide - 1 + totalSlides) % totalSlides;
            showGallerySlide(currentGallerySlide);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentGallerySlide = (currentGallerySlide + 1) % totalSlides;
            showGallerySlide(currentGallerySlide);
        });
    }
}

// --- Save Car Button functionality ---
async function setupSaveCarButton(carId) {
    const saveCarBtn = document.getElementById('saveCarBtn');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
        saveCarBtn.style.display = 'none'; // Hide button if user not logged in
        return;
    }

    const user = JSON.parse(userData);
    saveCarBtn.style.display = 'inline-block'; // Show button if user is logged in

    let isCarSaved = false;

    try {
        const response = await fetch(`http://localhost:3000/api/v1/users/${user._id}/saved-cars`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.cars) {
                isCarSaved = data.cars.some(savedCar => savedCar._id === carId);
            } else {
                console.error('Invalid response format:', data);
            }
        } else {
            const errorData = await response.json();
            console.error('Failed to fetch saved cars:', errorData);
        }
    } catch (error) {
        console.error('Error checking if car is saved:', error);
    }

    updateSaveButtonUI(isCarSaved);

    saveCarBtn.addEventListener('click', async () => {
        try {
            const method = isCarSaved ? 'DELETE' : 'POST';
            const endpoint = `http://localhost:3000/api/v1/users/${user._id}/saved-cars/${carId}`;
            
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                isCarSaved = !isCarSaved; // Toggle state
                updateSaveButtonUI(isCarSaved);
                alert(isCarSaved ? 'Car saved successfully!' : 'Car unsaved.');
            } else {
                const errorData = await response.json();
                console.error('Failed to save/unsave car:', errorData);
                alert(errorData.message || 'Failed to save/unsave car.');
            }
        } catch (error) {
            console.error('Error saving/unsaving car:', error);
            alert('An error occurred. Please try again.');
        }
    });
}

function updateSaveButtonUI(isSaved) {
    const saveCarBtn = document.getElementById('saveCarBtn');
    if (isSaved) {
        saveCarBtn.textContent = 'Unsave Car';
        saveCarBtn.classList.add('saved');
    } else {
        saveCarBtn.textContent = 'Save Car';
        saveCarBtn.classList.remove('saved');
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', loadCarDetails);

