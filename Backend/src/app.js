import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import settlementRoutes from "./routes/settlementRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://spliteaser.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("SplitEase API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/groups", expenseRoutes);
app.use("/api/groups", settlementRoutes);

export default app;