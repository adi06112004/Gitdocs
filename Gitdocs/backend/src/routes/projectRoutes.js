import express from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectCollaborators,
  getProjects,
  rollbackProjectActivity,
  removeProjectCollaborator,
  updateProject,
  upsertProjectCollaborator,
} from "../controllers/projectController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getProjects);
router.post("/", protect, createProject);
router.post("/rollback/:commitId", protect, rollbackProjectActivity);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);
router.get("/:id/collaborators", protect, getProjectCollaborators);
router.post("/:id/collaborators", protect, upsertProjectCollaborator);
router.delete("/:id/collaborators/:userId", protect, removeProjectCollaborator);

export default router;
