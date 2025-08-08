# 🐳 Docker Setup for Event Analytics (Backend)

This guide helps you run the **Event Analytics backend** using Docker and Docker Compose. It sets up:

- Node.js backend (TypeScript)
- MongoDB
- Redis
- Background worker

---

## 📁 Project Structure

event-analytics/
├── src/
├── .env
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json

## ⚙️ Prerequisites

- Docker Desktop installed and running
- Git (to clone the repo)

---

## 🔧 Environment Configuration

Create a `.env` file in the root folder with the following content:

PORT=4000  
MONGO_URI=mongodb://mongo:27017/event_analytics  
REDIS_HOST=redis  
REDIS_PORT=6379

> ⚠️ These hostnames (mongo, redis) must match the service names in `docker-compose.yml`.

---

## 🚀 Running the App with Docker

### 1. Clone the Repository

git clone https://github.com/sachin2891/event-analytics.git  
cd event-analytics

### 2. Build and Start Services

docker-compose up --build

### What Happens:

- Backend server runs on http://localhost:4000
- MongoDB and Redis are automatically started
- Both the backend **API** and **worker** are run together inside the container using `concurrently`

---

## 🛠️ Available Docker Services

| Service | Description             | Port  |
| ------- | ----------------------- | ----- |
| Backend | Node.js API + worker    | 4000  |
| MongoDB | NoSQL database          | 27017 |
| Redis   | In-memory queue storage | 6379  |

---

## 📦 Custom Scripts

Your `package.json` contains:

"scripts": {
"dev": "ts-node-dev --respawn --transpile-only src/index.ts",
"worker": "ts-node src/worker.ts",
"start:all": "concurrently \"npm run dev\" \"npm run worker\""
}

> Docker runs `npm run start:all` automatically to start both the server and the background job processor.

---

## 🧼 Stopping and Cleaning Up

### Stop the app:

CTRL+C

### Stop and remove all containers:

docker-compose down

---

## 🐞 Troubleshooting

- Port already in use? Make sure nothing is using port 4000, 27017, or 6379.
- MongoDB not connecting? Ensure you're using `mongo` as the hostname in `MONGO_URI`.

---

## 👥 Contributors

- @sachin2891

---

## 📘 License

This project is licensed under the ISC License.
