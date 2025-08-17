import "./load-env";
import express, { type Request, Response, NextFunction } from "express";
import { log } from "./vite";
// @ts-ignore - multer n'a pas de types dans ce projet
import multer from "multer";

export const app = express();
app.set("etag", false);

// Middleware global (désactive l'avertissement sur toutes les routes)
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// ✅ Middleware pour les JSON / formulaire volumineux
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ✅ Multer pour les uploads (multipart/form-data)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ✅ Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Simple health check for uptime monitoring
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Routes will be registered in serverless handler or local dev
if (process.env.NODE_ENV === "development" && process.env.DATABASE_URL) {
  const { registerRoutes } = await import("./routes");
  await registerRoutes(app);
  log("Routes registered for development");
} else if (!process.env.DATABASE_URL) {
  log("DATABASE_URL not set, API routes disabled", "warn");
} else {
  log("Production mode - routes will be registered by serverless handler");
}

// Gestion des erreurs globales
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Fichier trop volumineux (max 10MB)" });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});

export default app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== "1") {
  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, "0.0.0.0", () => {
    log(`✨ Server running on http://localhost:${port}`);
  });
}
