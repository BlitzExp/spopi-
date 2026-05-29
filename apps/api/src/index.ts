import "./lib/env";
import cors from "cors";
import express from "express";
import { prisma } from "@spopi/db";
import { errorMiddleware } from "./lib/errors";
import { v1Router } from "./routes/v1";

const app = express();
const port = Number(process.env.API_PORT ?? process.env.PORT) || 4000;
const host = process.env.API_HOST || "0.0.0.0";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.use("/v1", v1Router);
app.use(errorMiddleware);

app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});
