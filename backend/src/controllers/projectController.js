import Project from "../models/Project.js";
import Commit from "../models/Commit.js";
import {
  canAdminProject,
  canReadProject,
  canWriteProject,
} from "../utils/projectPermissions.js";

const serializeProjectForSnapshot = (project) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  owner: project.owner,
  branches: project.branches || ["main"],
  currentBranch: project.currentBranch || "main",
  collaborators: project.collaborators || [],
  isPublic: Boolean(project.isPublic),
  isArchived: Boolean(project.isArchived),
});

export const getProjects = async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user.id }, { "collaborators.userId": req.user.id }],
  }).sort({ updatedAt: -1 });
  return res.json(projects);
};

export const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (!canReadProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return res.json(project);
};

export const createProject = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Project name is required" });
  }

  const project = await Project.create({
    name,
    description: description || "Git-aware document repository",
    owner: req.user.id,
    branches: ["main"],
    currentBranch: "main",
    collaborators: [],
  });

  await Commit.create({
    message: `Created project: ${project.name}`,
    type: "create",
    projectId: project.id,
    documentId: "project-meta",
    branch: project.currentBranch || "main",
    author: req.user.id,
    snapshot: JSON.stringify({ after: serializeProjectForSnapshot(project) }),
  });

  return res.status(201).json(project);
};

export const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (!canWriteProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const beforeState = serializeProjectForSnapshot(project);
  const previousName = project.name;
  const { name, description, currentBranch, branches } = req.body;

  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (currentBranch) project.currentBranch = currentBranch;
  if (Array.isArray(branches)) {
    project.branches = Array.from(new Set([...project.branches, ...branches]));
  }

  await project.save();

  await Commit.create({
    message: `Updated project: ${previousName} -> ${project.name}`,
    type: "update",
    projectId: project.id,
    documentId: "project-meta",
    branch: project.currentBranch || "main",
    author: req.user.id,
    snapshot: JSON.stringify({
      before: beforeState,
      after: serializeProjectForSnapshot(project),
    }),
  });

  return res.json(project);
};

export const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (project.owner !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await Commit.create({
    message: `Deleted project: ${project.name}`,
    type: "delete",
    projectId: project.id,
    documentId: "project-meta",
    branch: project.currentBranch || "main",
    author: req.user.id,
    snapshot: JSON.stringify({ before: serializeProjectForSnapshot(project) }),
  });

  await project.deleteOne();
  return res.json({ message: "Project deleted" });
};

export const rollbackProjectActivity = async (req, res) => {
  const { commitId } = req.params;
  const { activityMeta } = req.body || {};
  let activity = null;

  if (commitId) {
    activity = await Commit.findById(commitId);
  }

  // Fallback for stale client-side ids: resolve by metadata from existing DB activity.
  if (!activity && activityMeta?.projectId && activityMeta?.type) {
    const fallbackFilter = {
      projectId: activityMeta.projectId,
      type: activityMeta.type,
    };

    if (activityMeta.message) {
      fallbackFilter.message = activityMeta.message;
    }

    if (activityMeta.branch) {
      fallbackFilter.branch = activityMeta.branch;
    }

    // Prefer user-owned activities when resolving ambiguous matches.
    fallbackFilter.$or = [{ author: req.user.id }, { author: activityMeta.author }];

    activity = await Commit.findOne(fallbackFilter).sort({ createdAt: -1 });
  }

  if (!activity) {
    return res.status(404).json({
      message: "Rollback source activity not found. Refresh activity list and try again.",
    });
  }

  if (!["update", "delete"].includes(activity.type)) {
    return res.status(400).json({ message: "Only update/delete activities can be rolled back" });
  }

  let snapshot;
  try {
    snapshot = JSON.parse(activity.snapshot || "{}");
  } catch (error) {
    return res.status(400).json({ message: "Invalid rollback snapshot" });
  }

  const previous = snapshot.before;
  if (!previous) {
    return res.status(400).json({ message: "No previous state found for rollback" });
  }

  if (activity.type === "update") {
    const project = await Project.findById(activity.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found for rollback" });
    }
    if (!canWriteProject(project, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    project.name = previous.name ?? project.name;
    project.description = previous.description ?? project.description;
    project.branches = Array.isArray(previous.branches)
      ? previous.branches
      : project.branches;
    project.currentBranch = previous.currentBranch || project.currentBranch;
    project.collaborators = Array.isArray(previous.collaborators)
      ? previous.collaborators
      : project.collaborators;
    project.isPublic = Boolean(previous.isPublic);
    project.isArchived = Boolean(previous.isArchived);

    await project.save();

    await Commit.create({
      message: `Rollback applied for project update: ${project.name}`,
      type: "update",
      projectId: project.id,
      documentId: "project-meta",
      branch: project.currentBranch || "main",
      author: req.user.id,
      snapshot: JSON.stringify({ after: serializeProjectForSnapshot(project) }),
    });

    return res.json({ message: "Project rolled back to previous version", project });
  }

  const canRestoreDeleted = activity.author === req.user.id || req.user.role === "admin";
  if (!canRestoreDeleted) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const existing = await Project.findById(previous.id || activity.projectId);
  if (existing) {
    return res.status(400).json({ message: "Project already exists" });
  }

  const restored = await Project.create({
    _id: previous.id || activity.projectId,
    name: previous.name,
    description: previous.description || "",
    owner: previous.owner || activity.author,
    branches: Array.isArray(previous.branches) ? previous.branches : ["main"],
    currentBranch: previous.currentBranch || "main",
    collaborators: Array.isArray(previous.collaborators) ? previous.collaborators : [],
    isPublic: Boolean(previous.isPublic),
    isArchived: Boolean(previous.isArchived),
  });

  await Commit.create({
    message: `Rollback restored deleted project: ${restored.name}`,
    type: "create",
    projectId: restored.id,
    documentId: "project-meta",
    branch: restored.currentBranch || "main",
    author: req.user.id,
    snapshot: JSON.stringify({ after: serializeProjectForSnapshot(restored) }),
  });

  return res.json({ message: "Deleted project restored", project: restored });
};

export const getProjectCollaborators = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (!canReadProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return res.json(project.collaborators || []);
};

export const upsertProjectCollaborator = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (!canAdminProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { userId, permission } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }
  if (!["read", "write", "admin"].includes(permission)) {
    return res
      .status(400)
      .json({ message: "permission must be read, write, or admin" });
  }
  if (userId === project.owner) {
    return res
      .status(400)
      .json({ message: "Owner already has full access by default" });
  }

  const existing = project.collaborators.find((c) => c.userId === userId);
  if (existing) {
    existing.permission = permission;
  } else {
    project.collaborators.push({ userId, permission });
  }

  await project.save();
  return res.json(project.collaborators);
};

export const removeProjectCollaborator = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (!canAdminProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { userId } = req.params;
  project.collaborators = project.collaborators.filter((c) => c.userId !== userId);
  await project.save();
  return res.json(project.collaborators);
};
