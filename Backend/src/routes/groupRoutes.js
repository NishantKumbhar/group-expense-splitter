import express from "express";
import {
  createGroup,
  addMember,
  getMyGroups,
  getGroupById,
  getGroupBalances,
  getSimplifiedDebts,
  getDashboardSummary
} from "../controllers/groupController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createGroup);

router.post("/:groupId/members", protect, addMember);

router.get("/:groupId/balances", protect, getGroupBalances);

router.get("/:groupId/simplified-debts", protect, getSimplifiedDebts);

router.get("/", protect, getMyGroups);

router.get(
  "/dashboard-summary",
  protect,
  getDashboardSummary
);

router.get("/:groupId", protect, getGroupById);



export default router;