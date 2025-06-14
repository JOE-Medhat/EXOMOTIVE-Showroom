document.querySelector(".calculate-btn").addEventListener("click", function() {
    let amount = document.getElementById("loanAmount").value;
    let months = document.getElementById("loanMonths").value;

    if (!amount || amount <= 0) {
        alert("Please enter a valid loan amount.");
        return;
    }
    if (!months || months < 1 || months > 60) {
        alert("Please enter months between 1 and 60.");
        return;
    }

    let monthlyPayment = (amount / months).toFixed(2);
    document.getElementById("calculationResult").textContent = `Estimated Monthly Payment: ${monthlyPayment} EGP`;
});


const cars = [
    {
        name: "BMW F90 M5 CS",
        image: "images\\HD-wallpaper-2022-bmw-m5-cs-side-car-removebg-preview.png",
        info: "635 HP | 3.0 sec 0-100 | Top speed: 305 KMH | Price: 8,500,000 EGP"
    },
    {
        name: "Porsche 911 Turbo S Cabriolet",
        image: "images\\porsche-model.png",
        info: " 640 HP | 2.6 sec 0-100 | Top speed: 330 KMH | Price: 13,000,000 EGP"
    },
    {
        name: "Mercedes-AMG GT",
        image: "images\\5-AMG-GT-UK-review-2024-removebg-preview.png",
        info: " 523 HP | 3.3 sec 0-100 | Top speed: 312 KMH | Price: 11,000,000 EGP"
    }

];
let currentIndex = 0;

function updateCar() {
    let image = document.getElementById("carousel-image");
    let carName = document.getElementById("car-name");
    let carInfo = document.getElementById("car-info");

    // Remove existing animation classes
    image.classList.remove("fade-in", "fade-out");

    // Add fade-out effect
    image.classList.add("fade-out");

    setTimeout(() => {
        // Change content
        image.src = cars[currentIndex].image;
        carName.textContent = cars[currentIndex].name;
        carInfo.textContent = cars[currentIndex].info;

        // Remove fade-out and add fade-in effect
        image.classList.remove("fade-out");
        image.classList.add("fade-in");
    }, 300); // Delay before changing image
}

function nextCar() {
    currentIndex = (currentIndex + 1) % cars.length;
    updateCar();
}

function prevCar() {
    currentIndex = (currentIndex - 1 + cars.length) % cars.length;
    updateCar();
}

// Initialize first car
updateCar();