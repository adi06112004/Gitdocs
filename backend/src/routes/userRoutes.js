import express from "express";
import {

  getUsers,
  getUserById,
  getMe,
  updateMe,
  changePassword,
  updatePreferences,

} 
from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";


const router = express.Router();


router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.patch("/me/password", protect, changePassword);
router.patch("/me/preferences", protect, updatePreferences);


router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);


export default router;
