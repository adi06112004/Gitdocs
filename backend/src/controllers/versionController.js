import Branch from "../models/Branch.js";
import Commit from "../models/Commit.js";
import Document from "../models/Document.js";
import Project from "../models/Project.js";
import {
  canReadProject,
  canWriteProject,
} from "../utils/projectPermissions.js";

export const getAllVersions = async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user.id }, { "collaborators.userId": req.user.id }],
  }).select("_id");
  const projectIds = projects.map((p) => p._id.toString());
  const branches = await Branch.find({ projectId: { $in: projectIds } }).sort({ createdAt: -1 });
  return res.status(200).json(branches);
};

export const getVersionById = async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) {
    return res.status(404).json({ message: "Branch not found" });
  }
  const project = await Project.findById(branch.projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (!canReadProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return res.status(200).json(branch);
};

export const createVersion = async (req, res) => {
  const { name, projectId } = req.body;
  if (!name || !projectId) {
    return res.status(400).json({ message: "Branch name and projectId are required" });
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (!canWriteProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const branchName = name.trim();
  const existingBranch = await Branch.findOne({ name: branchName, projectId });
  if (existingBranch) {
    return res.status(400).json({ message: "Branch already exists" });
  }

  const branch = await Branch.create({
    name: branchName,
    projectId,
    createdBy: req.user.id,
  });

  if (!project.branches.includes(branchName)) {
    project.branches.push(branchName);
  }
  project.currentBranch = branchName;
  await project.save();

  return res.status(201).json(branch);
};

export const deleteVersion = async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) {
    return res.status(404).json({ message: "Branch not found" });
  }

  if (branch.name === "main") {
    return res.status(400).json({ message: "Cannot delete main branch" });
  }

  const project = await Project.findById(branch.projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (!canWriteProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (project) {
    project.branches = project.branches.filter((b) => b !== branch.name);
    if (project.currentBranch === branch.name) {
      project.currentBranch = project.branches.length ? project.branches[0] : "main";
    }
    await project.save();
  }

  await branch.deleteOne();
  return res.status(200).json({ message: "Branch deleted" });
};

export const syncBranch = async (req, res) => {
  const { projectId, sourceBranch, targetBranch, mode } = req.body;
  if (!projectId || !sourceBranch || !targetBranch) {
    return res
      .status(400)
      .json({ message: "projectId, sourceBranch and targetBranch are required" });
  }

  const normalizedMode = mode === "pull" ? "pull" : "push";
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (!canWriteProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!project.branches.includes(sourceBranch)) {
    return res.status(404).json({ message: "Source branch not found" });
  }
  if (!project.branches.includes(targetBranch)) {
    return res.status(404).json({ message: "Target branch not found" });
  }

  const fromBranch = normalizedMode === "pull" ? targetBranch : sourceBranch;
  const toBranch = normalizedMode === "pull" ? sourceBranch : targetBranch;

  const sourceDocs = await Document.find({ projectId, branch: fromBranch });
  let updatedCount = 0;

  for (const sourceDoc of sourceDocs) {
    const existing = await Document.findOne({
      projectId,
      branch: toBranch,
      name: sourceDoc.name,
    });

    if (existing) {
      existing.content = sourceDoc.content;
      existing.lastEditedBy = req.user.id;
      await existing.save();
    } else {
      await Document.create({
        name: sourceDoc.name,
        content: sourceDoc.content,
        projectId,
        projectName: project.name,
        branch: toBranch,
        createdBy: req.user.id,
        lastEditedBy: req.user.id,
      });
    }
    updatedCount += 1;
  }

  await Commit.create({
    message: `${normalizedMode.toUpperCase()} ${fromBranch} -> ${toBranch}`,
    projectId,
    documentId: "branch-sync",
    branch: toBranch,
    author: req.user.id,
    parentCommit: null,
    snapshot: `Synced ${updatedCount} docs`,
  });

  return res.status(200).json({
    message: `${normalizedMode} completed`,
    updatedCount,
    fromBranch,
    toBranch,
  });
};
