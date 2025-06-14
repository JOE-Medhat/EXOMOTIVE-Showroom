# EXOMOTIVE-Showroom
# Intruduction
This repository is dedicated to the EXOMOTIVE Showroom, a specialized web application designed exclusively for showcasing exotic and luxury cars. The platform serves as a premium virtual showroom where users can explore rare, high-performance, and luxury vehicles from world-renowned brands.

EXOMOTIVE focuses solely on exotic supercars and hypercars, offering detailed profiles that include high-quality images, technical specifications, pricing, and unique features of each vehicle. From brands like Ferrari, Lamborghini and Rolls Royce to limited-edition models and custom-built masterpieces — EXOMOTIVE is the go-to destination for exotic car enthusiasts.
The project consists of two main parts:

Frontend: A modern, dark-themed interface built with HTML, CSS, and JavaScript, allowing users to browse exotic car collections, view detailed car pages, and manage user profiles effortlessly.

Backend: A powerful Node.js, Express and MongoDB server that manages user accounts, authentication, saved cars, and dynamic car data retrieval — all centered around exotic vehicles only.
This platform is designed for car collectors, enthusiasts, and anyone passionate about the world of luxury and performance automobiles.

---

## Features

✅ Browse an exclusive collection of exotic and rare cars  
✅ View detailed car specifications, performance stats, and pricing  
✅ High-quality car images gallery  
✅ User registration and login system  
✅ Save favorite cars to user profile  
✅ Dark-themed, modern, and responsive user interface  
✅ Backend API for managing cars, users, and saved cars  
✅ Fully scalable and maintainable architecture  

---

## Technologies Used

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript**

### Backend
- **Node.js**
- **Express.js**
- **MongoDB**
- **JWT for Authentication**

### Others
- **RESTful APIs**
- **Multer (for image uploads)**
- **Local Storage**

---

## Installation

1. **Clone this repository:**

```bash
git clone https://github.com/JOE-Medhat/EXOMOTIVE-Showroom.git
cd EXOMOTIVE-Showroom

2. Install backend dependencies:

cd backend
npm install

3. Set up Environment Variables:

PORT= 3000
API_URL = /api/v1
MONGO_URI = mongodb+srv://jo3medhat:youssef%402005@cluster0.ikgnmiq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

4. Run the app:
npm start

```

![{21A3C1DA-CC9D-488D-9953-5ACCC4617A92}](https://github.com/user-attachments/assets/17a9dddd-ee4f-475b-9908-1a6b46cb0730)

![{215E81AF-494E-4B34-8E8D-2A36D4E300EB}](https://github.com/user-attachments/assets/76c524fd-c4d0-42bf-baef-23005f9cc36e)

![{601BE10F-7B45-4D5E-A8EB-DAF47CD841B0}](https://github.com/user-attachments/assets/1c4705c9-a283-4cff-8736-a8e3ae28ff93)

![{1AE761FF-1BA3-4B0A-B4D5-0E273337A5BC}](https://github.com/user-attachments/assets/c2db0c46-a36f-420a-aa80-5d612bca360f)

![{92A625BF-BF4C-49EC-809C-96D0548E8AC8}](https://github.com/user-attachments/assets/4fff4b05-e516-4fa0-8061-f46765b1147e)

![{6FAFF8FE-79C5-4CF2-BEA0-CE04D57B32FC}](https://github.com/user-attachments/assets/e9157e1a-8c54-49ef-8fdb-582c4f5b51b8)

## API Endpoints

### Car Routes

| Method | Endpoint                    | Description                                   |
|--------|----------------------------|------------------------------------------------|
| GET    | `/api/v1/cars`             | Get all cars with filtering and pagination     |
| GET    | `/api/v1/cars/count`       | Get total car count for dashboard              |
| GET    | `/api/v1/cars/:id`         | Get single car by ID                           |
| POST   | `/api/v1/cars`             | Create new car (Protected, requires Auth)      |
| PUT    | `/api/v1/cars/:id`         | Update car (Protected, requires Auth)          |
| DELETE | `/api/v1/cars/:id`         | Delete car (Protected, requires Auth)          |

---

### Admin Routes

| Method | Endpoint                       | Description                        |
|--------|--------------------------------|------------------------------------|
| POST   | `/api/v1/admins/register`      | Register new admin                 |
| POST   | `/api/v1/admins/login`         | Admin login                        |
| POST   | `/api/v1/admins/init`          | Create initial super admin         |
| GET    | `/api/v1/admins/profile`       | Get admin profile (Protected)      |
| PUT    | `/api/v1/admins/profile`       | Update admin profile (Protected)   |
| GET    | `/api/v1/admins`               | Get all admins                     |
| GET    | `/api/v1/admins/:id`           | Get admin by ID                    |
| PUT    | `/api/v1/admins/:id`           | Update admin by ID                 |
| DELETE | `/api/v1/admins/:id`           | Delete admin by ID                 |

---

### User Routes

| Method | Endpoint                              | Description                        |
|--------|---------------------------------------|------------------------------------|
| POST   | `/api/v1/users/register`              | Register new user                  |
| POST   | `/api/v1/users/login`                 | User login                         |
| GET    | `/api/v1/users/profile`               | Get user profile (Protected)       |
| PUT    | `/api/v1/users/profile`               | Update user profile (Protected)    |
| GET    | `/api/v1/users`                       | Get all users                      |
| GET    | `/api/v1/users/count`                 | Get total user count               |
| POST   | `/api/v1/users/update-inactive-users` | Update inactive users (Protected)  |
| GET    | `/api/v1/users/:id`                   | Get user by ID                     |
| PUT    | `/api/v1/users/:id`                   | Update user by ID                  |
| DELETE | `/api/v1/users/:id`                   | Delete user by ID                  |

---

### Saved Cars Routes (User-specific)

| Method | Endpoint                                   | Description                          |
|--------|--------------------------------------------|--------------------------------------|
| GET    | `/api/v1/users/:id/saved-cars`             | Get saved cars for a user (Protected)|
| POST   | `/api/v1/users/:id/saved-cars/:carId`      | Save a car for user (Protected)      |
| DELETE | `/api/v1/users/:id/saved-cars/:carId`      | Remove saved car (Protected)         |

---

## Contact

For questions, suggestions, or business inquiries regarding **EXOMOTIVE Showroom**, feel free to reach out:

- **Names** Youssef Medhat, Abdelrahman Hazem, Moustafa Mahmoud, Ammar Elbanna, Radwa Khalid
- **Email:** joe.medhat.dev@gmail.com
- **GitHub:** [JOE-Medhat](https://github.com/JOE-Medhat)
- **LinkedIn:** [Your LinkedIn Profile](www.linkedin.com/in/youssef-medhat-2a1645364)

We welcome feedback, collaborations, and contributions to improve EXOMOTIVE Showroom.
