# College Event Management System (MERN)

> **College Event Management System (Final Year Project)**

A full-stack MERN (MongoDB, Express, React, Node.js) web application for managing campus events, student registrations, digital ticket passes, and real-time QR code attendance scanning.

---

## 🌟 Key Features

* **Phase 1: Architecture & Database**
  * Modern modular architecture with Express API backend and Vite + React frontend.
  * MongoDB Atlas integration with health monitoring.
* **Phase 2: Authentication & Role-Based Access Control (RBAC)**
  * Secure user registration and login with `bcrypt` password hashing and JWT authentication.
  * User roles: **Student**, **Event Organizer**, and **Admin**.
* **Phase 3: Event Management (CRUD)**
  * Event creation, editing, and deletion for organizers.
  * Category filtering (*Technical, Cultural, Sports, Workshop, Seminar, Other*) and keyword search.
  * Real-time capacity and spots-remaining progress tracking.
* **Phase 4: Ticket Booking & RSVP System**
  * One-click RSVP registration for students with duplicate booking prevention.
  * Unique Ticket ID generation (`TKT-...`).
  * "My Tickets" pass dashboard.
  * Live attendee roster for event organizers.
* **Phase 5: Digital QR Passes & Live Scanner**
  * Cryptographically signed QR ticket tokens (`QR_TOKEN_SECRET`).
  * Digital Event Pass modal with printable pass.
  * In-browser live camera QR scanner (`html5-qrcode`) with manual ticket ID fallback.
  * Real-time check-in validation and duplicate admission detection.

---

## 🛠️ Project Structure

```text
college-event-system/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Navbar, EventCard, TicketPassModal
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Home, Login, Register, CreateEvent, EventDetails, MyEvents, QRScanner
│   │   └── services/       # Axios API client
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express + Node.js backend
│   ├── config/             # Database & environment configuration
│   ├── controllers/        # Auth, Event, and Registration controllers
│   ├── middleware/         # Auth, Role authorization, and Error handling
│   ├── models/             # User, Event, and Registration Mongoose models
│   ├── routes/             # API routes (/api/auth, /api/events, /api/registrations)
│   ├── utils/              # JWT generator & QR token utilities
│   ├── package.json
│   └── server.js
├── .gitignore              # Protects .env, node_modules, and build outputs
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas account or local MongoDB instance

### 1. Server Setup
```bash
cd server
npm install
copy .env.example .env     # On Linux/macOS: cp .env.example .env
```
Edit `.env` and provide your MongoDB URI, JWT secret, and QR token secret:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/college_events
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
QR_TOKEN_SECRET=your_qr_token_secret_key_here
CLIENT_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.
