import Project from "../models/Project.js";
import Commit from "../models/Commit.js";
import Document from "../models/Document.js";
import Branch from "../models/Branch.js";
import User from "../models/User.js";
import {
  canAdminProject,
  canReadProject,
  canWriteProject,
  normalizePermission,
} from "../utils/projectPermissions.js";

const serializeProjectForSnapshot = (project) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  owner: project.owner,
  branches: project.branches || ["main"],
  currentBranch: project.currentBranch || "main",
  collaborators: project.collaborators || [],
  inviteHistory: project.inviteHistory || [],
  isPublic: Boolean(project.isPublic),
  isArchived: Boolean(project.isArchived),
});

async function buildCollaborationPayload(project) {
  const list = project.collaborators || [];
  const ownerUser = await User.findById(project.owner).select("name email");
  const ids = list.map((c) => c.userId).filter(Boolean);
  const users =
    ids.length > 0
      ? await User.find({ _id: { $in: ids } }).select("name email")
      : [];
  const byId = Object.fromEntries(
    users.map((u) => [String(u._id), u]),
  );

  const members = list.map((c, idx) => {
    const perm = normalizePermission(c.permission);
    const u = byId[c.userId];
    return {
      id: `collab-${c.userId}-${idx}`,
      userId: c.userId,
      permission: perm,
      role: perm,
      username: u?.name,
      name: u?.name,
      email: u?.email,
      status: "active",
    };
  });

  const owner = {
    userId: project.owner,
    name: ownerUser?.name,
    email: ownerUser?.email,
  };

  return {
    members,
    inviteHistory: (project.inviteHistory || []).map((h) =>
      typeof h.toObject === "function" ? h.toObject() : h,
    ),
    owner,
  };
}

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
  const { name, description, currentBranch, branches, isPublic, isArchived } =
    req.body;

  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (currentBranch) project.currentBranch = currentBranch;
  if (Array.isArray(branches)) {
    project.branches = Array.from(new Set([...project.branches, ...branches]));
  }
  if (isPublic !== undefined || isArchived !== undefined) {
    if (!canAdminProject(project, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (isPublic !== undefined) project.isPublic = Boolean(isPublic);
    if (isArchived !== undefined) project.isArchived = Boolean(isArchived);
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

  // Delete all related entities
  await Commit.deleteMany({ projectId: project.id });
  await Document.deleteMany({ projectId: project.id });
  await Branch.deleteMany({ projectId: project.id });

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

  if (!["update", "delete", "commit"].includes(activity.type)) {
    return res.status(400).json({ message: "Only update, delete, or commit activities can be rolled back" });
  }

  // --- Document Rollback Improvisation ---
  if (activity.type === "commit" || activity.documentId) {
    const document = await Document.findById(activity.documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found or already deleted." });
    }

    // Find the previous commit for this document before this activity
    const previousCommit = await Commit.findOne({
      documentId: activity.documentId,
      createdAt: { $lt: activity.createdAt }
    }).sort({ createdAt: -1 });

    const previousContent = previousCommit ? previousCommit.snapshot : "";

    document.content = previousContent;
    document.lastEditedBy = req.user.id;
    document.updatedAt = new Date();
    await document.save();

    await Commit.create({
      message: `Rolled back to previous version of document`,
      projectId: activity.projectId,
      documentId: activity.documentId,
      branch: activity.branch || "main",
      author: req.user.id,
      snapshot: previousContent,
      type: "commit"
    });

    return res.json({ message: "Document rollback completed successfully." });
  }
  // ---------------------------------------

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
    project.inviteHistory = Array.isArray(previous.inviteHistory)
      ? previous.inviteHistory
      : project.inviteHistory;
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
    inviteHistory: Array.isArray(previous.inviteHistory) ? previous.inviteHistory : [],
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
  const payload = await buildCollaborationPayload(project);
  return res.json(payload);
};

export const upsertProjectCollaborator = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (!canAdminProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { email, userId: userIdBody, permission, role } = req.body || {};
  const permissionNorm = normalizePermission(permission || role);

  if (!["read", "write", "admin"].includes(permissionNorm)) {
    return res
      .status(400)
      .json({ message: "permission must be read, write, or admin" });
  }

  let targetUserId = req.params.userId || userIdBody;
  let invitedEmail = null;

  if (!targetUserId && email) {
    invitedEmail = String(email).toLowerCase().trim();
    const invitedUser = await User.findOne({ email: invitedEmail });
    if (!invitedUser) {
      return res.status(404).json({
        message: "No registered user with that email. They must sign up first.",
      });
    }
    targetUserId = invitedUser.id;
  }

  if (!targetUserId) {
    return res.status(400).json({ message: "email or userId is required" });
  }

  if (targetUserId === project.owner) {
    return res
      .status(400)
      .json({ message: "Owner already has full access by default" });
  }

  const targetUser = await User.findById(targetUserId).select("email name");
  if (!targetUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const historyEmail = invitedEmail || targetUser.email;
  const isNew = !project.collaborators.some((c) => c.userId === targetUserId);
  if (isNew) {
    project.collaborators.push({ userId: targetUserId, permission: permissionNorm });
  } else {
    const existing = project.collaborators.find((c) => c.userId === targetUserId);
    if (existing) existing.permission = permissionNorm;
  }

  if (!project.inviteHistory) project.inviteHistory = [];
  project.inviteHistory.push({
    email: historyEmail,
    invitedBy: req.user.id,
    permission: permissionNorm,
    status: "accepted",
    userId: targetUserId,
    createdAt: new Date(),
  });

  await project.save();
  const payload = await buildCollaborationPayload(project);
  return res.status(isNew ? 201 : 200).json(payload);
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
  const payload = await buildCollaborationPayload(project);
  return res.json(payload);
};
