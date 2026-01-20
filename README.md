# Dynamic Application Form System

A robust, full-stack application form builder and submission system. This project consists of a high-performance **React frontend** for candidates and admins, and a secure **Express/Node.js backend** powered by **Firebase Firestore**.

## 🏗️ Architecture Overview

The system allows administrators to dynamically add "Extra Fields" to a base application form. Candidates can fill out these forms, and their responses are validated and stored securely.

### Tech Stack
*   **Frontend:** React (Vite), TypeScript, Tailwind CSS, TanStack Query, Firebase Auth (Client SDK).
*   **Backend:** Node.js, Express, Firebase Admin SDK, Zod (Validation), Firestore (NoSQL Database).
*   **Database:** Cloud Firestore (Scalable, Real-time).
*   **Authentication:** Firebase Authentication (Google Sign-In).

### Key Features
*   **Dynamic Form Builder:** Admins can add/remove/toggle extra questions.
*   **Security:** "Zero-Trust" backend validates all inputs. Submission emails are locked to the authenticated user's token.
*   **Role-Based Access:** Admins have exclusive access to form builders and submission lists.
*   **Robustness:** Gracefully handles missing database indexes and provides fallback sorting.

---

## 🚀 Setup Guide

### 1. Prerequisites
*   Node.js (v18+)
*   Firebase Project (with Authentication & Firestore enabled)

### 2. Backend Setup (`/backend`)

The backend handles API requests, validation, and database interactions.

1.  **Navigate to the backend folder:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3. **Firebase Service Account:**
    *It is seperately attached in the email please check it
4.  **Configure Environment:**
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=4000
    # Path to your downloaded service account key
    FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
    # Comma-separated list of admin emails
    ADMIN_EMAILS=admin@test.com
    ```
    Replace the admin@test.com by your email to get the admin privilages

    I have attached the serviceAccountKey.json file in the email copy it into the backend folder.

6.  **Start the Server:**
    ```bash
    npm run dev
    ```
    *   Server runs on `http://localhost:4000`

---

### 3. Frontend Setup (`/frontend`)

The frontend provides the user interface for candidates and admins.

1.  **Navigate to the frontend folder:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the `frontend` directory:
    ```env
    # Firebase Client Config (Attached in the email)
    VITE_FIREBASE_API_KEY=AIzaSy...
    VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your-project
    VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=...
    VITE_FIREBASE_APP_ID=...

    # Admin emails list (For UI visibility logic)
    VITE_ADMIN_EMAILS=dmin@test.com
    ```
    Replace the admin@test.com by your email to get the admin privilages


4.  **Start the Application:**
    ```bash
    npm run dev
    ```
    *   App runs on `http://localhost:5173`

---

## 🛡️ Security Architecture

1.  **Authentication:**
    *   The frontend authenticates using Google Sign-In.
    *   For every API request, the frontend sends a secure **ID Token** in the `Authorization` header.

2.  **Authorization:**
    *   **Backend:** Middleware (`authenticate`, `requireAdmin`) verifies the ID token and checks if the user is an admin before allowing sensitive actions.
    *   **Data Integrity:** The backend strictly enforces that `candidateEmail` matches the token's email, preventing impersonation.

3.  **Validation:**
    *   **Zod** schemas ensure all incoming data (static and dynamic fields) matches the expected types and constraints before it ever touches the database.

## 📂 Project Structure

```bash
DynamicForm/
├── backend/
│   ├── constants/
│   │   └── staticFields.js    # Hardcoded fields (Name, Email, etc.)
│   ├── middleware/
│   │   └── auth.js            # Auth & Admin verification middleware
│   ├── routes/
│   │   ├── forms.js           # Form management endpoints
│   │   └── submissions.js     # Submission handling endpoints
│   ├── validation/
│   │   └── schemas.js         # Zod schemas for input validation
│   ├── firebaseAdmin.js       # Firebase Admin SDK initialization
│   ├── server.js              # Express app entry point
│   └── serviceAccountKey.json # (Secret) Firebase credentials
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── form/          # Form-specific components (FieldInput, etc.)
    │   │   └── layout/        # Navbar, ProtectedRoute
    │   ├── hooks/
    │   │   └── useAuth.ts     # Auth hook (User state, Admin check)
    │   ├── lib/
    │   │   ├── api.ts         # API fetch wrapper
    │   │   ├── firebase.ts    # Firebase Client SDK init
    │   │   └── types.ts       # TypeScript interfaces
    │   ├── routes/
    │   │   ├── AdminFormBuilder.tsx # Drag-and-drop form editor
    │   │   ├── AdminSubmissions.tsx # Submissions list view
    │   │   ├── CandidateForm.tsx    # Public application form
    │   │   ├── MySubmissions.tsx    # User's history view
    │   │   └── Login.tsx            # Auth page
    │   ├── App.tsx            # Main router
    │   └── main.tsx           # Entry point
    └── index.html
```

---

## 📡 API Documentation

All API requests must include the `Authorization` header with a valid Firebase ID Token:
`Authorization: Bearer <firebase_id_token>`

### 1. Forms (`/forms`)

#### `GET /forms/:formId`
Retrieves the form template structure.
- **Auth:** Required
- **Response:**
  ```json
  {
    "id": "123",
    "title": "Candidate Application Form",
    "permanentFields": [...],
    "extraFields": [
      {
        "id": "field_1",
        "label": "Years of Experience",
        "type": "number",
        "required": true,
        "active": true
      }
    ]
  }
  ```

#### `PUT /forms/:formId/fields`
Updates the dynamic "Extra Fields" for a form.
- **Auth:** Admin Only
- **Body:**
  ```json
  {
    "extraFields": [
      {
        "id": "new_field",
        "label": "Portfolio URL",
        "type": "text",
        "required": false,
        "active": true,
        "order": 1
      }
    ]
  }
  ```

### 2. Submissions (`/submissions`)

#### `POST /forms/:formId/submissions`
Submit a new application.
- **Auth:** Required
- **Body:**
  ```json
  {
    "staticValues": {
      "candidateName": "John Doe",
      "candidatePhone": "1234567890"
      // candidateEmail is auto-filled from Auth Token
    },
    "extraValues": {
      "field_1": 5,
      "new_field": "https://myportfolio.com"
    }
  }
  ```

#### `GET /my-submissions`
Get the authenticated user's submission history.
- **Auth:** Required
- **Response:**
  ```json
  {
    "total": 1,
    "submissions": [
      {
        "id": "sub_123",
        "staticValues": { ... },
        "createdAt": "2024-03-20T10:00:00.000Z",
        "status": "Submitted"
      }
    ]
  }
  ```

#### `GET /admin/forms/:formId/submissions`
List all submissions for a specific form.
- **Auth:** Admin Only
- **Response:** (Same structure as above, but includes all users)

#### `DELETE /submissions/:submissionId`
Delete a specific submission.
- **Auth:** Admin or Owner (User who created it)
- **Response:**
  ```json
  {
    "message": "Submission deleted successfully",
    "id": "sub_123"
  }
  ```
