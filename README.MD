# TaskFlow - Task Management Application

A full-stack task management application built with FastAPI, PostgreSQL, SQLAlchemy, JWT Authentication, and Vanilla JavaScript.

TaskFlow allows users to securely register, authenticate, and manage their personal tasks through a responsive web interface. Users can create, update, search, filter, sort, complete, and delete tasks while ensuring strict user-level access control.

---

## Overview

TaskFlow provides a complete task management workflow with authentication and authorization built into the application.

The backend is developed using FastAPI and exposes RESTful APIs, while the frontend is built using modular Vanilla JavaScript and served directly through FastAPI.

Each authenticated user can only access and manage their own tasks.

---

## How It Works

### Authentication Flow

1. A user registers using a username, email, and password.
2. The password is securely hashed before being stored in the database.
3. The user logs in using valid credentials.
4. A JWT access token is generated.
5. The token is stored in the browser's Local Storage.
6. Protected requests include the token in the Authorization header.
7. FastAPI validates the token and identifies the authenticated user.

### Task Management Flow

After authentication, users can:

* Create tasks
* View tasks
* Search tasks by title
* Filter tasks by completion status
* Sort tasks by ID or title
* Update tasks
* Mark tasks as completed
* Delete tasks
* Navigate through paginated task results

Each task is linked to its owner, ensuring complete user isolation.

---

## Architecture

```text
┌──────────────────────────┐
│        Browser           │
│ HTML / CSS / JavaScript  │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│         FastAPI          │
│ API + Static File Server │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│ Authentication Layer     │
│ JWT + OAuth2             │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│      SQLAlchemy ORM      │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│     PostgreSQL DB        │
└──────────────────────────┘
```
---

## Technology Stack

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic
* Python-Jose
* Passlib
* OAuth2 Authentication

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* Fetch API

### Database

* PostgreSQL

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

---

### 2. Create a Virtual Environment

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

#### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

---

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Configure Environment Variables

Create a `.env` file in the project root directory.

```env
DATABASE_URL=postgresql://username:password@localhost:5432/taskdb

SECRET_KEY=your_secret_key_here

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

APP_NAME=TaskFlow
```

Replace the values with your own configuration.

---

### 5. Configure PostgreSQL

Create a PostgreSQL database:

```sql
CREATE DATABASE taskdb;
```

Ensure the database credentials match the values in your `.env` file.

---

### 6. Run the Application

```bash
uvicorn app.main:app --reload
```

---

## Application URLs

### Application

```text
http://127.0.0.1:8000
```

### Swagger Documentation

```text
http://127.0.0.1:8000/docs
```

### ReDoc Documentation

```text
http://127.0.0.1:8000/redoc
```

The frontend is served directly through FastAPI, so no separate frontend server is required.

---

## Authentication Workflow

```text
Register User
      │
      ▼
Store Hashed Password
      │
      ▼
Login
      │
      ▼
Generate JWT Token
      │
      ▼
Store Token in Browser
      │
      ▼
Send Token With Requests
      │
      ▼
Validate Token
      │
      ▼
Access Protected Resources
```

---

## Security Features

* Password Hashing Using Passlib
* JWT-Based Authentication
* Protected API Routes
* User-Level Authorization
* Secure Credential Validation
* Pydantic Request Validation
* Proper HTTP Error Handling

---

## Key Learning Outcomes

This project demonstrates:

* REST API Development With FastAPI
* JWT Authentication & Authorization
* SQLAlchemy ORM Relationships
* PostgreSQL Integration
* Dependency Injection
* Pydantic Validation
* Modular JavaScript Architecture
* CRUD Operations
* Pagination, Filtering & Sorting
* Frontend State Management
* User-Specific Data Security

---

## Future Improvements

Potential enhancements include:

* Task Categories
* Tags & Labels
* Due Dates
* Reminders
* Email Notifications
* Password Reset
* User Profile Management
* Task Analytics Dashboard
* Docker Support
* Automated Testing
* CI/CD Pipeline
* Role-Based Access Control

---

## License

This project is licensed under the MIT License.
