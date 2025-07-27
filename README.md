## 🚀 Getting Started

Follow these steps to get your development environment up and running.

### 1. Clone the Repository

git clone https://github.com/your-repo/event-analytics.git
cd event-analytics

### 2. Install Dependencies

npm install

### 3. Setup Environment Variables

Create a `.env` file in the root directory, based on the example below:

PORT=4000
MONGO_URI=mongodb://localhost:27017/analytics
REDIS_HOST=localhost
REDIS_PORT=6379

> **Note:** Adjust values to match your setup, especially MongoDB and Redis connection strings.

### 4. Start the Application and Worker

Open two separate terminal windows or tabs.

- **Start the API server (Node.js + Express):**

npm run dev

- **Start the BullMQ worker (for background jobs):**

npm run worker

## 📄 API Documentation (Swagger / OpenAPI)

You can explore the full API documentation and try out endpoints interactively:

- Open your browser and visit: [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

The Swagger UI presents all available API endpoints, request parameters, and response schemas.

---

## ⚙️ Workflow Overview

1. **Event Ingestion:**

- You can send user event data to the API (e.g., `POST /api/events`).
   - Events are validated and stored in MongoDB.

2. **Background Processing:**

- BullMQ workers process jobs such as analytics aggregation, sending notifications, etc.
   - Redis serves as a fast in-memory cache and queue backend.

3. **Real-time Analytics:**

- Kafka streams (optional) allow live event consumption.
   - WebSocket server broadcasts live event counts/updates to connected clients.

4. **API Rate Limiting & Security:**

- API requests are rate-limited using a Redis-backed rate limiter for abuse prevention.
   - Protected routes require API key authentication via headers (e.g., `x-api-key`).

---

## 📦 Available Scripts

| Command           | Description                               |
| ----------------- | ----------------------------------------- |
| `npm install`     | Installs dependencies                     |
| `npm run dev`     | Starts the API server with hot-reloading  |
| `npm run worker`  | Starts queue workers (BullMQ)             |

---

## 🛠️ Additional Setup

- **Swagger Docs:**

Maintain the OpenAPI spec file (`openapi.yaml`) in the project root to keep API docs updated.

---

## 📄 License

MIT License

---

Happy Analytics! 🎉
