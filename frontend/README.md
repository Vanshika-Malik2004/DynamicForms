# Dynamic Form Frontend

A modern, responsive React application for the Dynamic Form system. Built with **Vite**, **TypeScript**, and **Tailwind CSS**.

## 🏗️ Architecture

The frontend follows a **component-based architecture** and uses **TanStack Query** for efficient server state management.

### Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM v6
- **Auth**: Firebase Authentication (Google Sign-In)

### Architectural Flow
1.  **User Action**: User interacts with the UI (e.g., clicks "Submit").
2.  **Auth Layer**: `useAuth` hook verifies the user's Firebase token.
3.  **API Service**: `apiFetch` utility intercepts the request, injects the `Authorization: Bearer <token>` header, and handles errors.
4.  **Network Request**: The request is sent to the Backend API.
5.  **State Update**: React Query automatically caches the response or invalidates stale data (e.g., after a mutation), triggering a UI re-render.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── form/          # Form-specific components (FieldInput, etc.)
│   │   └── layout/        # Layout components (Navbar, ProtectedRoute)
│   ├── constants/
│   │   └── config.ts      # App-wide configuration
│   ├── hooks/
│   │   └── useAuth.ts     # Authentication state hook
│   ├── lib/
│   │   ├── api.ts         # Centralized API fetch wrapper
│   │   ├── firebase.ts    # Firebase Client SDK initialization
│   │   └── types.ts       # TypeScript interfaces for API data
│   ├── routes/
│   │   ├── AdminFormBuilder.tsx # Drag-and-drop dynamic form editor
│   │   ├── AdminSubmissions.tsx # Data grid for viewing submissions
│   │   ├── CandidateForm.tsx    # The actual application form
│   │   ├── Login.tsx            # Login page
│   │   └── MySubmissions.tsx    # User's submission history
│   ├── App.tsx            # Main router configuration
│   └── main.tsx           # Entry point
├── index.html            # HTML entry point
├── tailwind.config.js     # Tailwind configuration
└── vite.config.ts         # Vite configuration
```

## 🚀 Setup & Installation

1. Check out the Project readme for setup

## 🛡️ Key Components

### `ProtectedRoute`
A wrapper component that checks authentication status.
- If user is not logged in → Redirects to `/login`.
- If `requireAdmin` prop is true and user is not admin → Redirects to Home.

### `apiFetch`
A wrapper around the native `fetch` API.
- Automatically gets the current Firebase ID Token.
- Adds standard headers (`Content-Type`, `Authorization`).
- Centralizes error handling (e.g., auto-redirect on 401).

## 📦 Build for Production

```bash
npm run build
```
This generates a static `dist/` folder ready for deployment (e.g., Vercel, Netlify, Firebase Hosting).
