import express from "express";

import {
  createSettlement
} from "../controllers/settlementController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/:groupId/settlements",
  protect,
  createSettlement
);

export default router;