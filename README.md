# Task Management App

A full-stack task management application built with React, Express, and PostgreSQL.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Express 5, TypeScript
- **Database:** PostgreSQL
- **Testing:** Jest, Supertest

## Features

- Create, update, and delete tasks
- Set priority levels (low, medium, high)
- Set optional due dates
- Mark tasks as completed

## Prerequisites

- Node.js
- PostgreSQL

## Getting Started

### 1. Set up the database

Create a PostgreSQL database and note the connection URL. The server will automatically create the `tasks` table on startup.

### 2. Backend

```bash
cd server
npm install
```

Create a `.env` file:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<database>
```

Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:3001`.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## API Endpoints

| Method | Endpoint         | Description       |
|--------|------------------|-------------------|
| GET    | `/api/tasks`     | List all tasks    |
| POST   | `/api/tasks`     | Create a task     |
| PUT    | `/api/tasks/:id` | Update a task     |
| DELETE | `/api/tasks/:id` | Delete a task     |

## Testing

```bash
cd server
npm test
```
