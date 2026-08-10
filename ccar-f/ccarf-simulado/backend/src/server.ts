import "dotenv/config";
import express from "express";
import cors from "cors";
import "./db/connection";
import authRoutes from "./routes/auth";
import questionsRoutes from "./routes/questions";
import examRoutes from "./routes/exam";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use(questionsRoutes);
app.use(examRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`CCAR-F backend listening on http://localhost:${PORT}`);
});
