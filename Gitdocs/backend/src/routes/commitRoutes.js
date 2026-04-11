import express from "express";
import { createCommit, getCommits } from "../controllers/commitController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getCommits);
router.post("/", protect, createCommit);

export default router;
