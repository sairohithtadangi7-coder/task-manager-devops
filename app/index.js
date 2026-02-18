const express = require("express");
const { v4: uuidv4 } = require("uuid");
const client = require("prom-client");

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------
// In-memory task storage
// -------------------------
let tasks = [];

// -------------------------
// Prometheus Metrics Setup
// -------------------------
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// HTTP request counter
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"]
});

// Middleware to track requests
app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });
  });
  next();
});

// -------------------------
// Routes
// -------------------------

// Root
app.get("/", (req, res) => {
  res.json({ message: "Task Manager API Running 🚀" });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// Get all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Create new task
app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask = {
    id: uuidv4(),
    title
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Delete task
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;

  const initialLength = tasks.length;
  tasks = tasks.filter(task => task.id !== id);

  if (tasks.length === initialLength) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json({ message: "Task deleted successfully" });
});

// -------------------------
// Metrics endpoint
// -------------------------
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// -------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

