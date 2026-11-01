# Appointment Manager (MERN + TypeScript)

> A modern, full-stack appointment management application built with **React**, **Node.js**, **Express**, **TypeScript**, and **MongoDB Atlas**. Designed with clean architecture, strict type safety, responsive UI/UX, and comprehensive automated test coverage.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features & Requirements Fulfillment](#key-features--requirements-fulfillment)
3. [Technology Stack](#technology-stack)
4. [Architecture & Project Structure](#architecture--project-structure)
5. [Starting Seed Data](#starting-seed-data)
6. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
7. [Installation & Getting Started](#installation--getting-started)
8. [API Documentation](#api-documentation)
9. [Testing Suite](#testing-suite)
10. [Resilient Database & Fallback Architecture](#resilient-database--fallback-architecture)
11. [Candidate Kit Disclosures & Handover Notes](#candidate-kit-disclosures--handover-notes)

---

## Project Overview

The **Appointment Manager** is a production-ready application developed to schedule, track, filter, search, and update client appointments. The system is architected as a decoupled client-server application adhering to SOLID design principles, clean RESTful conventions, and end-to-end TypeScript type contracts.

---

## Key Features & Requirements Fulfillment

| Assessment Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Display Appointments** | Renders customer name, service type, formatted date/time, notes, and visual status badges. Responsive grid and card layouts for mobile and desktop. | ✅ Completed |
| **Add Appointment** | Modal dialog with inputs for Customer Name, Service, Date/Time picker, initial Status, and optional Notes. | ✅ Completed |
| **Validate Required Fields & Errors** | Dual-layer validation (client-side form feedback + server-side Mongoose/Express validation) with clear inline error messages and error summaries. | ✅ Completed |
| **Change Appointment Status** | Dropdown status selector on each card (`Pending`, `Confirmed`, `Cancelled`) with instant UI update and database synchronization via `PATCH /api/appointments/:id/status`. | ✅ Completed |
| **Filter by Status** | Dedicated filter bar with tabs: `All`, `Pending`, `Confirmed`, and `Cancelled`, each displaying dynamic count badges. Interactive stat cards also act as quick filters. | ✅ Completed |
| **Customer Name Search** | Real-time search field allowing instant filtering and server-side case-insensitive regex query matching. Includes a one-click clear button. | ✅ Completed |
| **Clean & Responsive UI** | Custom dark-slate glassmorphism design system using modern typography (`Plus Jakarta Sans` & `Inter`), micro-interactions, responsive flex/grid layouts, and toast notifications. Usable on screens from 320px mobile to 4K desktop. | ✅ Completed |
| **Node.js / Express API** | Strict TypeScript Express REST API with input sanitization, error handling middleware, and health monitoring. | ✅ Completed |
| **MongoDB Atlas Persistence** | Persistent storage connected to MongoDB Atlas cluster with automatic initial collection seeding on first boot. | ✅ Completed |
| **Resilient DB Fallback** | Automated fallback to in-memory MongoDB (`mongodb-memory-server`) if Atlas credentials fail or network is unavailable, ensuring zero downtime during review. | ✅ Completed |
| **One-Click Reset** | "Reset Seed Data" button in navbar and API endpoint (`POST /api/appointments/reset`) to restore the 3 candidate kit seed records at any time. | ✅ Completed |

---

## Technology Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Language:** TypeScript 5.x
- **Framework:** Express 4.x
- **Database / ODM:** MongoDB Atlas with Mongoose 8.x
- **Testing:** Jest, ts-jest, Supertest, mongodb-memory-server
- **Dev Tooling:** ts-node-dev, dotenv, cors

### Frontend
- **Framework:** React 18.x with TypeScript
- **Build Tool:** Vite 6.x
- **Icons:** Lucide React
- **Styling:** Custom CSS3 Design System (Glassmorphism, CSS Custom Properties, Responsive Media Queries)
- **HTTP Client:** Fetch API with typed responses and error wrappers

---

## Architecture & Project Structure

```
appointment manager/
├── README.md                      # Comprehensive documentation & handover notes
├── package.json                   # Root package with monorepo utility scripts
├── .gitignore                     # Git ignore rules for node_modules, dist, .env
├── backend/
│   ├── .env                       # Environment variables (Atlas URI, Port)
│   ├── .env.example               # Template for environment configuration
│   ├── jest.config.ts             # Jest TypeScript test configuration
│   ├── package.json               # Backend dependencies & test scripts
│   ├── tsconfig.json              # Backend TypeScript compiler settings
│   ├── src/
│   │   ├── app.ts                 # Express app initialization, CORS, routes, error handlers
│   │   ├── server.ts              # Server bootstrap, DB connect & graceful shutdown
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB Atlas connection & in-memory fallback manager
│   │   ├── controllers/
│   │   │   └── appointmentController.ts  # CRUD, filtering, search, status updates
│   │   ├── models/
│   │   │   └── Appointment.ts     # Mongoose schema, TypeScript interfaces & indexes
│   │   ├── routes/
│   │   │   └── appointmentRoutes.ts # REST API route mapping
│   │   └── data/
│   │       ├── seedData.ts        # Initial 3 appointments from specification
│   │       └── seed.ts            # Standalone CLI seeding script
│   └── tests/
│       └── appointment.test.ts    # 23 automated integration and unit tests
└── frontend/
    ├── index.html                 # HTML template with Google Fonts
    ├── package.json               # Frontend dependencies & build scripts
    ├── tsconfig.json              # Frontend TypeScript compiler settings
    ├── vite.config.ts             # Vite configuration with API reverse proxy
    └── src/
        ├── main.tsx               # React application entry point
        ├── App.tsx                # Main container component & state coordination
        ├── index.css              # Custom modern design system
        ├── types/
        │   └── appointment.ts     # Shared TypeScript domain interfaces
        ├── services/
        │   └── api.ts             # Typed API client and error handling
        └── components/
            ├── Navbar.tsx          # Brand header, Reset Seed Data, New Appointment button
            ├── StatsOverview.tsx   # Interactive metric cards (Total, Pending, Confirmed, Cancelled)
            ├── FilterBar.tsx       # Search bar and status tabs
            ├── AppointmentCard.tsx # Appointment card with inline status selector & delete
            ├── AppointmentModal.tsx# Creation modal with field-level validation feedback
            └── Toast.tsx           # Auto-dismissing toast notifications
```

---

## Starting Seed Data

The application comes pre-populated with the three required records:

| Customer | Service | Date / Time | Status |
| :--- | :--- | :--- | :---: |
| **Alex Morgan** | Consultation | `2026-11-02 10:00` | `Pending` |
| **Jamie Lee** | Follow-up | `2026-11-02 11:30` | `Confirmed` |
| **Taylor Smith** | Review | `2026-11-03 14:00` | `Cancelled` |

> 💡 **Tip:** You can reset the database back to this initial state anytime by clicking the **"Reset Seed Data"** button in the navbar, or by running `npm run seed` in the backend.

---

## Prerequisites & Environment Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Environment Configuration
The backend contains a `.env` file pre-configured for MongoDB Atlas:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.atogklp.mongodb.net/appointment_manager?retryWrites=true&w=majority&appName=Cluster0
```

*(A template is also available in `backend/.env.example`)*

---

## Installation & Getting Started

### 1. Install Dependencies
You can install dependencies for both backend and frontend from the root directory:

```bash
# From the root directory:
npm run install:all
```

Or install individually:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start the Backend API
```bash
# In the backend directory:
npm run dev

# Or from root:
npm run dev:backend
```
The API server will start on `http://localhost:5000`. You will see output confirming connection to MongoDB Atlas and verification of the seed records.

### 3. Start the Frontend Application
```bash
# In the frontend directory:
npm run dev

# Or from root:
npm run dev:frontend
```
The Vite development server will start on `http://localhost:3000`. Open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

## API Documentation

Base URL: `http://localhost:5000/api`

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Verifies service uptime and environment status.
- **Response:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-31T12:55:15.847Z",
    "service": "Appointment Manager API",
    "environment": "development"
  }
  ```

### 2. Get All Appointments (with Filter & Search)
- **Endpoint:** `GET /api/appointments`
- **Query Parameters:**
  - `status` *(optional)*: `All` | `Pending` | `Confirmed` | `Cancelled`
  - `search` *(optional)*: Substring search across `customerName` (case-insensitive)
  - `sortBy` *(optional)*: `dateTime` | `customerName` | `createdAt` (default: `dateTime`)
  - `sortOrder` *(optional)*: `asc` | `desc` (default: `asc`)
- **Example Request:** `GET /api/appointments?status=Pending&search=Alex`
- **Response:**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "6ae5e533675a31e1253bc35a",
        "customerName": "Alex Morgan",
        "service": "Consultation",
        "dateTime": "2026-11-02T10:00:00.000Z",
        "status": "Pending",
        "notes": "Initial client consultation regarding project requirements",
        "createdAt": "2026-10-31T12:55:15.847Z",
        "updatedAt": "2026-10-31T12:55:15.847Z"
      }
    ]
  }
  ```

### 3. Create Appointment
- **Endpoint:** `POST /api/appointments`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "customerName": "Jordan Casey",
    "service": "System Architecture Review",
    "dateTime": "2026-11-10T14:30:00.000Z",
    "status": "Pending",
    "notes": "Discuss cloud migration plan"
  }
  ```
- **Validation Rules:**
  - `customerName`: Required, trimmed, min 2 characters, max 100 characters.
  - `service`: Required, trimmed, min 2 characters, max 100 characters.
  - `dateTime`: Required, must be a valid ISO date timestamp.
  - `status`: Must be one of `['Pending', 'Confirmed', 'Cancelled']` (defaults to `'Pending'`).
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Appointment created successfully",
    "data": { ... }
  }
  ```
- **Error Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "error": "Validation failed",
    "errors": [
      "Customer name is required",
      "Date and time are required"
    ]
  }
  ```

### 4. Update Appointment Status
- **Endpoint:** `PATCH /api/appointments/:id/status`
- **Request Body:**
  ```json
  {
    "status": "Confirmed"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Appointment status updated to Confirmed",
    "data": { ... }
  }
  ```

### 5. Update Full Appointment
- **Endpoint:** `PUT /api/appointments/:id`
- **Request Body:** Any updated fields (`customerName`, `service`, `dateTime`, `status`, `notes`).
- **Response (200 OK):** Updated appointment document.

### 6. Delete Appointment
- **Endpoint:** `DELETE /api/appointments/:id`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Appointment deleted successfully",
    "data": { "id": "6ae5e533675a31e1253bc35a" }
  }
  ```

### 7. Reset to Initial Seed Data
- **Endpoint:** `POST /api/appointments/reset`
- **Response (200 OK):** Clears database and restores the 3 starting seed appointments.

---

## Testing Suite

The project includes an automated test suite executed with **Jest**, **ts-jest**, **Supertest**, and an isolated **MongoMemoryServer** instance. Tests run hermetically without needing external internet access.

### Running Tests
```bash
# In backend directory:
npm test

# Or from root:
npm test
```

### Test Coverage Highlights (23 Tests, 100% Passing)
- **`GET /api/appointments`**:
  - Retrieves all 3 seed appointments.
  - Filters by `Pending`, `Confirmed`, and `Cancelled` accurately.
  - Handles `All` query.
  - Rejects invalid status queries with clean 400 error.
  - Customer name search (case-insensitive substring).
  - Empty search results handling.
  - Simultaneous search + status filtering combination.
- **`GET /api/appointments/:id`**:
  - Retrieval by valid ObjectId.
  - 404 response for non-existent IDs.
  - 400 response for malformed ObjectId formats.
- **`POST /api/appointments`**:
  - Successful creation with valid payload.
  - Rejection of missing/empty `customerName`.
  - Rejection of missing/empty `service`.
  - Rejection of missing or invalid `dateTime`.
  - Rejection of unauthorized status values.
- **`PATCH /api/appointments/:id/status`**:
  - Updates status to `Confirmed`.
  - Updates status to `Cancelled`.
  - Rejects invalid enum values.
  - Returns 404 for non-existent appointments.
- **`DELETE /api/appointments/:id`**:
  - Deletes appointment and verifies removal from database.
- **`POST /api/appointments/reset`**:
  - Clears mutated state and restores initial 3 starting appointments.

---

## Resilient Database & Fallback Architecture

To adhere to the evaluation criteria:
> *"Persist data in MongoDB if the environment allows within the time limit. If setup becomes a blocker, communicate early and explain your fallback."*

The database connection layer (`backend/src/config/db.ts`) is designed with a **dual-tier connection strategy**:
1. **Primary**: Connects to the live **MongoDB Atlas** cluster using the provided connection URI. When connected, it verifies if the collection is populated; if empty, it seeds the 3 starting appointments.
2. **Automated Fallback**: If Atlas is unreachable (e.g. strict firewall, offline evaluation environment, or network timeout), the connection logic intercepts the error and starts an in-memory MongoDB instance (`mongodb-memory-server`) locally. It logs a clear notice to the console and seeds the starting data into memory.
3. **Hermetic Test Isolation**: When `NODE_ENV === 'test'`, tests automatically utilize an isolated memory database instance to prevent dirtying production data.

---

## Candidate Kit Disclosures & Handover Notes

In accordance with the candidate kit instructions:
- **Starter Templates:** Vite React TypeScript template was utilized for front-end scaffolding; Node.js/Express TypeScript backend was architected from scratch.
- **AI Assistance:** AI pair programming assistance was used for boilerplate generation, automated test cases, and documentation authoring. All application architecture, domain models, validations, UI components, and test scenarios were rigorously verified and tested against requirements.
- **Handover Notes for Future Iterations:**
  - *Authentication & Authorization:* Integration with JWT or OAuth (e.g., Auth0) for multi-tenant clinic / manager access.
  - *Pagination:* Adding `page` and `limit` cursor pagination on `GET /api/appointments` for datasets scaling past 1,000+ appointments.
  - *Calendar View:* Adding a monthly/weekly calendar view (e.g., with FullCalendar) alongside the card grid.
  - *Email/SMS Reminders:* Hooking into Twilio/SendGrid to send automated appointment confirmations and status change alerts.

