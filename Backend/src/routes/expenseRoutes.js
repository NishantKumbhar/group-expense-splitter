import express from "express";
import { addEqualExpense,addPercentageExpense,addCustomExpense } from "../controllers/expenseController.js";
import protect from "../middleware/authMiddleware.js";


const router = express.Router();

router.post(
  "/:groupId/expenses",
  protect,
  addEqualExpense, 
);

router.post(
  "/:groupId/expenses/percentage",
  protect,
  addPercentageExpense
);

router.post(
  "/:groupId/expenses/custom",
  protect,
  addCustomExpense
);

export default router;