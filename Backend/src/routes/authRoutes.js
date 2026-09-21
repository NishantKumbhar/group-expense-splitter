import express from "express";

import {
  registerUser,
  loginUser
} from "../controllers/authcontroller.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed",
    userId: req.userId
  });
});

export default router;