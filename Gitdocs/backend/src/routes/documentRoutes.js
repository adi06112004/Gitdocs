import express from "express";
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
} from "../controllers/documentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getDocuments);
router.post("/", protect, createDocument);
router.get("/:id", protect, getDocumentById);
router.put("/:id", protect, updateDocument);
router.delete("/:id", protect, deleteDocument);

export default router;
