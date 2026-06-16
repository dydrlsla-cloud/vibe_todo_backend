import dns from "node:dns";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import todoRoutes from "./routes/todos.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.loadEnvFile(path.join(__dirname, ".env"));

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI;

if (!MONGO_URL) {
  console.error("❌ MONGO_URL 환경변수가 없습니다. .env 파일을 확인해주세요.");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    host: mongoose.connection.host || null,
    database: mongoose.connection.name || null,
  });
});

app.use("/todos", todoRoutes);

async function startServer() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ MongoDB 연결성공!");
    console.log(`📦 Atlas DB: ${mongoose.connection.host}/${mongoose.connection.name}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB 연결실패:", error.message);
    process.exit(1);
  }
}

startServer();
