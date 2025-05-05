# 📂 Task Tracker Backend

A collaborative task tracking backend built with **Node.js**, **Express**, **MongoDB**, **Redis**, **Kafka**, and **WebSockets**. Features include real-time updates, user authentication, task filtering, comments, attachments, and a notification system.

---

## 🚀 Features

- JWT-based Authentication
- Role-based project and task access
- Task creation, assignment, status update
- Comments & attachments on tasks
- Redis-based caching layer
- Kafka-based event-driven notification system
- WebSocket (socket.io) integration for real-time updates
- MongoDB for data storage
- RESTful APIs with organized route structure

---

## 🧪 Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **Messaging**: Apache Kafka (via KafkaJS), Zookeeper
- **Real-Time**: Socket.IO
- **Caching**: Redis
- **File Uploads**: Multer
- **Authentication**: JWT
- **Containerization**: Docker, Docker Compose

---

## 📦 Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- MongoDB Atlas account

---

## ⚙️ Setup Instructions

### Installation
1. Clone the repository:

```sh
git clone <your-repo-url>
cd task-tracker-backend
```

2. Set up `.env`:

Create a `.env` file in the root directory and add the following:

```sh
PORT=5000
MONGO_URI=<Your MongoDB Atlas Connection String>
JWT_SECRET=your_jwt_secret_key
```

3. Run redis,kafka and zookeeper via docker

Start services using the command

```sh
docker-compose up -d

check containers using
```

```sh
docker ps
```

4. Start the backend server

```sh
npm install 
npm run dev 
```

5. Start kafka notification Consumer

```sh
node kafka/consumers/taskNotificationConsumer.js
```

## 🧪 API Testing with Postman

Use JWT authentication for protected routes:

---

### Register

**POST** `/api/auth/register`

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123"
}
```

### Login

**POST** `/api/auth/login`

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

### Get Profile 

**GET** `/api/auth/me`
Add Authorization header with Bearer token

### Create Task 

**POST** /api/tasks

```json
{
  "title": "Design Homepage",
  "description": "Create layout for landing page",
  "dueDate": "2025-05-15",
  "projectId": "<project_id>",
  "assignedTo": "<user_id>",
  "priority": "High",
  "status": "open"
}
```

### Search and Filter Tasks

**GET** /api/tasks?q=homepage&status=open

### Update Task Status

**PATCH** /api/tasks/:id/status

```json
{
  "status": "completed"
}
```

### Update Task 

**PUT** /api/tasks/:id

```json
{
  "title": "Design Homepage v2",
  "description": "Update UI based on feedback"
}
```

### Delete Task 

**DELETE** /api/tasks/:id

### Add Comment

**POST** /api/tasks/:taskId/comments

```json
{
  "content": "Please review this section"
}
```

### Upload Attachment

**POST** /api/tasks/:taskId/attachments

Form data: 
key : file(type: File)
Value : Choose your file 

### Join Project 

**POST** /api/projects/:projectId/join