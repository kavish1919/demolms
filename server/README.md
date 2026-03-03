# LMS Backend API

This is the backend API for the Learning Management System, built with Node.js, Express, and MySQL.

## Prerequisites

*   Node.js (v18 or higher)
*   MySQL Server

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the root directory (copy from example if available, DO NOT commit real secrets):
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=lms_app
    DB_PASSWORD=your_secure_password
    DB_NAME=lms_db
    JWT_SECRET=your_jwt_secret
    ```

3.  **Database Setup**
    Ensure MySQL is running and the `lms_db` database is created.
    Run the seed script to create an initial admin:
    ```bash
    npx ts-node src/seed.ts
    ```

## Scripts

*   `npm run dev`: Start the development server (with hot-reload).
*   `npm run build`: Compile TypeScript to JavaScript.
*   `npm start`: Run the production build.

## API Endpoints

*   `POST /api/auth/login`: User login.
*   `GET /api/auth/me`: Get current user profile (Requires Bearer token).
