import express from "express";
import { errorMiddlewaresv } from "./middlewares/errorMiddlewares.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

import userRouter from "./routes/userRoutes.js";
import courseRouter from "./routes/courseRouter.js";
import statsRouter from "./routes/statsRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", statsRouter);
app.use("/api/v1", paymentRouter);

export default app;

app.use(errorMiddlewaresv);
