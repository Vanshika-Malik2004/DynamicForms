# Dynamic Form Backend

A production-ready Express.js backend for managing dynamic candidate application forms with Firebase authentication and Firestore storage.

## 🏗️ Architecture

- **Framework**: Express.js (Node.js)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google Sign-In)
- **Validation**: Zod
- **Authorization**: Email-based admin whitelist

### Architectural Flow
1.  **Request**: Client sends HTTP request with Firebase ID Token.
2.  **Middleware**: `authenticate` middleware verifies the token and decodes user info. `requireAdmin` checks permissions if needed.
3.  **Validation**: Zod schemas validate the request body (headers, types, required fields).
4.  **Controller**: Route handlers execute business logic (e.g., dynamic field rendering, data processing).
5.  **Database**: Data is read from or written to Firestore.
6.  **Response**: JSON response is sent back to the client.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with:
  - Authentication enabled (Google provider)
  - Firestore database created
  - Service account key downloaded

## 📋 For setup see the project readme

## 📡 API Endpoints

### Health Check
- **GET** `/health`
  - Returns server status
  - No authentication required

### Forms (Authenticated)
- **GET** `/forms/:formId`
  - Fetch form template with extra fields
  - Requires: Firebase ID token

### Forms (Admin Only)
- **POST** `/forms`
  - Create a new form
  - Body: `{ "title": "Form Title" }` (optional)
  - Requires: Admin authentication

- **PUT** `/forms/:formId/fields`
  - Update extra fields for a form
  - Body: `{ "extraFields": [...] }`
  - Requires: Admin authentication

### Submissions (Authenticated)
- **POST** `/forms/:formId/submissions`
  - Submit a candidate application
  - Body: `{ "staticValues": {...}, "extraValues": {...} }`
  - Requires: Firebase ID token

### Submissions (Admin Only)
- **GET** `/admin/forms/:formId/submissions`
  - List all submissions for a form
  - Requires: Admin authentication

- **GET** `/admin/submissions/:submissionId`
  - Get single submission details
  - Requires: Admin authentication

## 🔐 Authentication

All API requests (except `/health`) require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

### How to Get ID Token (Frontend)

```javascript
const token = await firebase.auth().currentUser.getIdToken();
```

## 👤 Static Fields

The following 11 fields are hard-coded and cannot be modified:

**Required Fields:**
- `candidateName`
- `candidateEmail`
- `candidatePhone`
- `primarySkillSet`
- `candidateLocation`
- `preferredJobLocation`
- `experience` (number)

**Optional Fields:**
- `secondarySkillSet`
- `secondaryPreferredJobLocation`
- `coreExperience` (textarea)
- `expectation` (number)

## 🎨 Extra Fields

Admins can create custom fields with the following properties:

```json
{
  "id": "unique_field_id",
  "label": "Field Label",
  "type": "text|number|textarea",
  "required": true|false,
  "active": true|false,
  "order": 0
}
```

## 📁 Project Structure

```
backend/
├── server.js                    # Main Express server
├── firebaseAdmin.js             # Firebase Admin SDK setup
├── middleware/
│   └── auth.js                  # Authentication & authorization
├── routes/
│   ├── forms.js                 # Form management routes
│   └── submissions.js           # Submission routes
├── constants/
│   └── staticFields.js          # Static field definitions
├── validation/
│   └── schemas.js               # Zod validation schemas
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🛡️ Security Features

- ✅ Firebase token verification on all protected routes
- ✅ Email-based admin authorization
- ✅ Input validation using Zod schemas
- ✅ Static field whitelisting
- ✅ Extra field validation against active template
- ✅ Service account key excluded from version control

## 🧪 Testing the API

### 1. Create a Form (Admin)
```bash
curl -X POST http://localhost:4000/forms \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Software Engineer Application"}'
```

### 2. Add Extra Fields (Admin)
```bash
curl -X PUT http://localhost:4000/forms/FORM_ID/fields \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "extraFields": [
      {
        "id": "f1",
        "label": "Last Company",
        "type": "text",
        "required": false,
        "active": true,
        "order": 0
      }
    ]
  }'
```

### 3. Submit Application (Candidate)
```bash
curl -X POST http://localhost:4000/forms/FORM_ID/submissions \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "staticValues": {
      "candidateName": "John Doe",
      "candidateEmail": "john@example.com",
      "candidatePhone": "+1234567890",
      "primarySkillSet": "JavaScript, React",
      "candidateLocation": "New York",
      "preferredJobLocation": "Remote",
      "experience": 5
    },
    "extraValues": {
      "f1": "Google"
    }
  }'
```

## 🐛 Troubleshooting

### "Failed to load service account key"
- Ensure `serviceAccountKey.json` is in the `backend/` directory
- Check that `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env` is correct

### "Unauthorized" errors
- Verify Firebase ID token is valid and not expired
- Check Authorization header format: `Bearer <token>`

### "Forbidden" errors
- Ensure your email is in the `ADMIN_EMAILS` list in `.env`
- Email comparison is case-insensitive

### Port already in use
- Change `PORT` in `.env` to a different value
- Or kill the process using port 4000
