# GitDocs Frontend - API Documentation

This document outlines the API requirements for the GitDocs frontend application. The backend should implement these endpoints to support the full functionality of the React-based document management system.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Data Models

### User

```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "password": "string" // Only for creation/update, never returned
}
```

### Project

```json
{
  "id": "number",
  "name": "string",
  "description": "string",
  "createdAt": "string (ISO date)",
  "branches": "array of strings",
  "currentBranch": "string",
  "documents": "array of document IDs" // Optional, for reference
}
```

### Document

```json
{
  "id": "number",
  "name": "string",
  "content": "string",
  "projectId": "number",
  "branch": "string",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Commit

```json
{
  "id": "number",
  "message": "string",
  "projectId": "number",
  "branch": "string",
  "documentId": "number",
  "createdAt": "string (ISO date)",
  "authorId": "number"
}
```

### Version (Branch)

```json
{
  "id": "number",
  "name": "string",
  "projectId": "number",
  "createdAt": "string (ISO date)"
}
```

## API Endpoints

### Authentication

#### POST /auth/login

Login user with email and password.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_string"
}
```

**Error Responses:**

- 401: Invalid credentials
- 400: Missing fields

#### POST /auth/logout

Logout user (invalidate token).

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

#### GET /auth/me

Get current user info.

**Response (200):**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Error Responses:**

- 401: Unauthorized

#### POST /auth/forgot-password

Request password reset.

**Request Body:**

```json
{
  "email": "string"
}
```

**Response (200):**

```json
{
  "message": "Reset email sent"
}
```

#### POST /auth/resend-forgot-password

Resend password reset email.

**Request Body:**

```json
{
  "email": "string"
}
```

**Response (200):**

```json
{
  "message": "Reset email resent"
}
```

#### POST /auth/reset-password

Reset password with token.

**Request Body:**

```json
{
  "token": "string",
  "password": "string"
}
```

**Response (200):**

```json
{
  "message": "Password reset successfully"
}
```

### Projects

#### GET /projects

Get all projects for authenticated user.

**Response (200):**

```json
[
  {
    "id": 1,
    "name": "My Project",
    "description": "Git-aware document repository",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "branches": ["main"],
    "currentBranch": "main",
    "documents": []
  }
]
```

#### GET /projects/:id

Get project by ID.

**Response (200):** Same as single project object above.

**Error Responses:**

- 404: Project not found
- 403: Not authorized

#### POST /projects

Create new project.

**Request Body:**

```json
{
  "name": "string",
  "description": "string (optional)"
}
```

**Response (201):**

```json
{
  "id": 1,
  "name": "My Project",
  "description": "Git-aware document repository",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "branches": ["main"],
  "currentBranch": "main",
  "documents": []
}
```

#### PUT /projects/:id

Update project.

**Request Body:**

```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "currentBranch": "string (optional)"
}
```

**Response (200):** Updated project object.

#### DELETE /projects/:id

Delete project.

**Response (200):**

```json
{
  "message": "Project deleted"
}
```

### Documents

#### GET /documents

Get all documents for authenticated user.

**Query Parameters:**

- `projectId`: Filter by project
- `branch`: Filter by branch

**Response (200):**

```json
[
  {
    "id": 1,
    "name": "README.md",
    "content": "# My Document",
    "projectId": 1,
    "branch": "main",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /documents/:id

Get document by ID.

**Response (200):** Single document object.

#### POST /documents

Create new document.

**Request Body:**

```json
{
  "name": "string",
  "content": "string",
  "projectId": "number",
  "branch": "string"
}
```

**Response (201):** Created document object.

#### PUT /documents/:id

Update document.

**Request Body:**

```json
{
  "name": "string (optional)",
  "content": "string (optional)",
  "branch": "string (optional)"
}
```

**Response (200):** Updated document object.

#### DELETE /documents/:id

Delete document.

**Response (200):**

```json
{
  "message": "Document deleted"
}
```

### Commits

#### GET /commits

Get all commits.

**Query Parameters:**

- `projectId`: Filter by project
- `branch`: Filter by branch
- `documentId`: Filter by document

**Response (200):**

```json
[
  {
    "id": 1,
    "message": "Initial commit",
    "projectId": 1,
    "branch": "main",
    "documentId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "authorId": 1
  }
]
```

#### GET /commits/:id

Get commit by ID.

#### POST /commits

Create commit.

**Request Body:**

```json
{
  "message": "string",
  "projectId": "number",
  "branch": "string",
  "documentId": "number"
}
```

#### PUT /commits/:id

Update commit.

#### DELETE /commits/:id

Delete commit.

### Versions (Branches)

#### GET /versions

Get all versions/branches.

**Query Parameters:**

- `projectId`: Filter by project

**Response (200):**

```json
[
  {
    "id": 1,
    "name": "main",
    "projectId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /versions/:id

Get version by ID.

#### POST /versions

Create new branch/version.

**Request Body:**

```json
{
  "name": "string",
  "projectId": "number"
}
```

#### PUT /versions/:id

Update version.

#### DELETE /versions/:id

Delete version.

### Users

#### GET /users

Get all users (admin only).

#### GET /users/:id

Get user by ID.

#### POST /users

Create user (registration).

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

#### PUT /users/:id

Update user.

#### DELETE /users/:id

Delete user.

## Error Response Format

All errors should return JSON:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE" // Optional
}
```

## HTTP Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Database Schema Suggestions

### Tables

- users (id, name, email, password_hash, created_at)
- projects (id, name, description, user_id, created_at, current_branch)
- branches (id, name, project_id, created_at)
- documents (id, name, content, project_id, branch_id, created_at, updated_at)
- commits (id, message, document_id, user_id, created_at)

### Relationships

- User has many Projects
- Project has many Branches
- Project has many Documents
- Branch has many Documents
- Document has many Commits
- User has many Commits

## Additional Requirements

1. Implement JWT authentication
2. Validate all input data
3. Handle file uploads for document content if needed
4. Implement proper authorization (users can only access their own projects/documents)
5. Add rate limiting
6. Implement logging
7. Add API versioning if needed
8. Use proper HTTP caching headers
9. Implement pagination for list endpoints
10. Add comprehensive error handling

## Testing

Provide Postman collection or similar for testing all endpoints.

## Deployment

Ensure CORS is configured for frontend origin: `http://localhost:5173`

## Frontend Setup

```bash
npm install
npm run dev
```

## Tech Stack

- React 19
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- React Toastify</content>
  <parameter name="oldString"># React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
