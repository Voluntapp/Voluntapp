import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import opportunityRoutes from "./routes/opportunities";
import requestRoutes from "./routes/requests";
import { PORT } from "./config";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/opportunities", opportunityRoutes);
app.use("/requests", requestRoutes);

app.get("/health", (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Voluntapp backend running on port ${PORT}`);
});
