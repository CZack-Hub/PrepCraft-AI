# ⚡ PrepCraft AI - Backend API

> **High-performance Express 5 REST API powering the PrepCraft AI interview strategy platform, integrated with Google Gemini AI, PDF parsing, Puppeteer document generation, and MongoDB.**

---

## 📋 Overview

The backend service acts as the core processing engine for PrepCraft AI. It handles:
- **Candidate & Job Processing**: In-memory parsing of PDF resumes and job descriptions using `pdf-parse`.
- **Generative AI Orchestration**: Structured interview strategy synthesis using Google Gemini via the `@google/genai` SDK and Zod schema enforcement.
- **Document Export**: Headless browser PDF rendering via Puppeteer.
- **Identity & Security**: Secure cookie-based JWT authentication, password hashing with bcrypt, token blacklisting with MongoDB TTL indexing, and cascading account deletion.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express 5 (`5.2.1`)
- **Database**: MongoDB with Mongoose (`9.2.1`)
- **AI SDK**: `@google/genai` (`1.42.0`)
- **Schema Validation**: `zod` & `zod-to-json-schema`
- **File Uploads**: `multer` (in-memory buffer storage)
- **PDF Extraction**: `pdf-parse` v2
- **PDF Rendering**: `puppeteer` (`24.37.5`)
- **Authentication**: `jsonwebtoken`, `bcryptjs`, `cookie-parser`
- **CORS**: `cors` (configured with credentials support)

---

## 📁 Directory Structure

```text
Backend/
├── src/
│   ├── config/
│   │   └── db.js                   # MongoDB connection logic
│   ├── controllers/
│   │   ├── auth.controller.js      # Register, Login, Logout, Me, Delete Account
│   │   └── interview.controller.js # Strategy Generation, Reports, PDF Export, Deletion
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification & blacklist check
│   │   └── file.middleware.js      # Multer memory storage & PDF mime filter
│   ├── models/
│   │   ├── user.model.js           # User schema & password hashing
│   │   ├── interviewReport.model.js# Interview report & roadmap schema
│   │   └── blacklist.model.js      # Expired JWT tokens with 24h TTL index
│   ├── routes/
│   │   ├── auth.routes.js          # Authentication endpoint router
│   │   └── interview.routes.js     # Interview actions endpoint router
│   └── services/
│       └── ai.service.js           # Google Gemini AI prompts & Puppeteer PDF compiler
├── .env.example                    # Sample environment template
├── package.json                    # Dependencies & scripts
└── server.js                       # Express app bootstrap & middleware configuration
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `Backend/` root directory:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | Port for the Express server (default: `3000`) | `3000` |
| `MONGO_URI` | **Yes** | MongoDB connection string (Atlas or Local) | `mongodb://localhost:27017/prepcraft` |
| `JWT_SECRET` | **Yes** | Secret cryptographic key for signing JWTs | `your_jwt_secret_key` |
| `GOOGLE_GENAI_API_KEY` | **Yes** | Google Gemini API key from Google AI Studio | `AIzaSy...` |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The server will start with Nodemon auto-reload on `http://localhost:3000`.

---

## 📡 API Reference

### 🔐 Authentication Routes (`/api/auth`)

#### 1. Register User
- **`POST /api/auth/register`**
- **Body**: `{ "username": "John Doe", "email": "john@example.com", "password": "securepassword" }`
- **Response**: `201 Created` with user details & sets HTTP-only `token` cookie.

#### 2. Login User
- **`POST /api/auth/login`**
- **Body**: `{ "email": "john@example.com", "password": "securepassword" }`
- **Response**: `200 OK` with user details & sets HTTP-only `token` cookie.

#### 3. Current User Profile
- **`GET /api/auth/me`**
- **Headers**: Cookie containing valid JWT `token`.
- **Response**: `200 OK` with `{ "user": { "_id", "username", "email" } }`.

#### 4. Logout User
- **`POST /api/auth/logout`**
- **Headers**: Cookie containing valid JWT `token`.
- **Response**: `200 OK`. Clears auth cookie and saves active token to the MongoDB blacklist collection.

#### 5. Delete Account
- **`DELETE /api/auth/delete-account`**
- **Headers**: Cookie containing valid JWT `token`.
- **Action**: Cascades deletion across all interview reports created by the user, deletes the user document, blacklists token, and clears cookie.
- **Response**: `200 OK` with `{ "message": "Account and all associated data deleted successfully" }`.

---

### 🎯 Interview Routes (`/api/interview`)

#### 1. Generate Interview Strategy
- **`POST /api/interview/generate`**
- **Headers**: `Content-Type: multipart/form-data`, Cookie with JWT.
- **Form Fields**:
  - `resume` *(Optional file, PDF max 5MB)*
  - `jobDescriptionFile` *(Optional file, PDF max 5MB)*
  - `selfDescription` *(Optional text)*
  - `jobDescription` *(Optional text)*
  > *Note: At least one Job Description source (file or text) is required.*
- **Response**: `201 Created` with full interview report JSON.

#### 2. Get All User Reports
- **`GET /api/interview/all`**
- **Response**: `200 OK` with list of past strategies (title, matchScore, createdAt, _id).

#### 3. Get Report by ID
- **`GET /api/interview/report/:interviewId`**
- **Response**: `200 OK` with complete interview report document.

#### 4. Download PDF Dossier
- **`GET /api/interview/resume/pdf/:interviewId`**
- **Response**: Streams binary `application/pdf` generated via Puppeteer.

#### 5. Delete Strategy
- **`DELETE /api/interview/report/:interviewId`**
- **Response**: `200 OK` with `{ "message": "Interview report deleted successfully" }`.

---

## 🔒 Security Measures

1. **HTTP-Only Cookies**: Authentication cookies cannot be accessed via client-side JavaScript (`httpOnly: true, sameSite: "lax"`).
2. **Token Blacklisting**: Revoked tokens on logout or account deletion are blacklisted in MongoDB with a 24-hour TTL index that automatically purges them.
3. **In-Memory File Safety**: File uploads are buffered in RAM through `multer.memoryStorage()`, validated by MIME type, and never written to arbitrary disk directories.
4. **Cascaded Data Integrity**: Deleting an account systematically wipes all related interview reports to ensure zero orphaned data.
