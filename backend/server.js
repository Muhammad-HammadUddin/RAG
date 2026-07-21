import express from "express";
import helmet from "helmet";
import cors from "cors";
import { createClient } from "redis";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

import { env } from "./config/env.js";
import { apiRateLimiter,agentRateLimiter } from "./middleware/ratelimiter.js";
import { notFoundHandler, errorHandler } from "./middleware/errorhandler.js";
import agentRouter from "./routes/agent.js";
import { disconnect } from "./db.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { QdrantClient } from "@qdrant/js-client-rest";

const qdrantClient = new QdrantClient({
    url: env.QDRANT_URL,
});
const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

const allowedOrigins =
    env.ALLOWED_ORIGINS === "*"
        ? "*"
        : env.ALLOWED_ORIGINS.split(",");

app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "x-api-key"],
    })
);

app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        console.log(
            `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`
        );
    });

    next();
});

app.use(apiRateLimiter);

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: env.GOOGLE_API_KEY,
    model: "gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Knowledge Base",
});

async function initVectorStore() {
    try {
        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: env.QDRANT_URL,
                collectionName: "langchainjs-testing",
            }
        );

        app.set("vectorStore", vectorStore);
        globalThis.vectorStore = vectorStore;

        console.log("✅ Qdrant Vector Store Initialized");
    } catch (error) {
        console.error("❌ Vector Store Init Failed:", error.message);
    }
}

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://redis:6379",
});

redisClient.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
});

async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("✅ Redis Connected");
    } catch (err) {
        console.error("❌ Failed to connect to Redis:", err.message);
    }
}

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        vectorStoreReady: !!app.get("vectorStore"),
        redisConnected: redisClient.isReady,
        uptime: process.uptime(),
    });
});

app.use("/api/knowledge", agentRouter);

app.get("/", (req, res) => {
    res.send("RAG + Agent + Neon Server Running...");
});

app.use(notFoundHandler);
app.use(errorHandler);

let server;

const startServer = async () => {
    await connectRedis();
    await initVectorStore();

    server = app.listen(env.PORT, () => {
        console.log(
            `🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`
        );
    });
};

async function shutdown(signal) {
    console.log(`${signal} received, shutting down gracefully`);

    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
            console.log("✅ Redis Disconnected");
        }

        await disconnect();

        server?.close(() => {
            console.log("✅ Server Closed");
            process.exit(0);
        });
    } catch (err) {
        console.error("Shutdown Error:", err);
        process.exit(1);
    }

    setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});






startServer();