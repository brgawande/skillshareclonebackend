import express from "express";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";
import { getDashboardStats } from "../controllers/statsControllers.js";

const router = express.Router();

router
  .route("/admin/stats")
  .get(isAuthenticated, authorizedAdmin, getDashboardStats);

export default router;
