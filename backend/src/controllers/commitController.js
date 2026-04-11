import Commit from "../models/Commit.js";
import Project from "../models/Project.js";
import { canReadProject, canWriteProject } from "../utils/projectPermissions.js";

export const getCommits = async (req, res) => {
  const { projectId, branch } = req.query;
  const projectFilter = {
    $or: [{ owner: req.user.id }, { "collaborators.userId": req.user.id }],
  };

  if (projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!canReadProject(project, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    projectFilter._id = projectId;
  }

  const readableProjects = await Project.find(projectFilter).select("_id");
  const readableProjectIds = readableProjects.map((p) => p._id.toString());

  let filter;
  if (projectId) {
    filter = { projectId: { $in: readableProjectIds } };
    if (branch) {
      filter.branch = branch;
    }
  } else {
    const visibilityFilter = {
      $or: [
        { projectId: { $in: readableProjectIds } },
        {
          author: req.user.id,
          type: { $in: ["create", "update", "delete"] },
        },
      ],
    };

    if (branch) {
      filter = { $and: [{ branch }, visibilityFilter] };
    } else {
      filter = visibilityFilter;
    }
  }

  const commits = await Commit.find(filter).sort({ createdAt: -1 });
  return res.json(commits);
};

export const createCommit = async (req, res) => {
  const { message, projectId, documentId, branch, snapshot, parentCommit, type } = req.body;
  if (!message || !projectId || !documentId || !branch) {
    return res.status(400).json({ message: "Commit message, projectId, documentId and branch are required" });
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (!canWriteProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const commitHash = Math.random().toString(16).slice(2, 10);

  const commit = await Commit.create({
    message: `[${commitHash}] ${message}`,
    type: type || "commit",
    projectId,
    documentId,
    branch,
    author: req.user.id,
    parentCommit: parentCommit || null,
    snapshot: snapshot || "",
  });

  return res.status(201).json(commit);
};
