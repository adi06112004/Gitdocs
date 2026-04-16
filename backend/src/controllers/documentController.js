import Document from "../models/Document.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { canReadProject, canWriteProject } from "../utils/projectPermissions.js";
import cache from "../utils/cache.js";

export const getDocuments = async (req, res) => {
  const filter = {};
  const { projectId, branch } = req.query;

  if (projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!canReadProject(project, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    filter.projectId = projectId;
  }
  if (branch) filter.branch = branch;

  // Create cache key based on filters
  const cacheKey = `documents:${JSON.stringify(filter)}:${req.user.id}`;

  // Try to get from cache first
  let documents = await cache.get(cacheKey);
  if (documents) {
    return res.json(documents);
  }

  // If not in cache, fetch from database
  const rawDocs = await Document.find(filter).sort({ updatedAt: -1 });
  
  const userIds = [...new Set(rawDocs.map(d => d.createdBy).filter(Boolean))];
  const users = await User.find({ _id: { $in: userIds } }, "name");
  const userMap = users.reduce((acc, u) => {
    acc[u._id.toString()] = u.name;
    return acc;
  }, {});

  documents = rawDocs.map(doc => {
    const docObj = doc.toJSON();
    docObj.authorName = userMap[doc.createdBy] || "Unknown";
    return docObj;
  });

  // Cache the result for 5 minutes
  await cache.set(cacheKey, documents, 300);

  return res.json(documents);
};

export const getDocumentById = async (req, res) => {
  const cacheKey = `document:${req.params.id}`;

  // Try to get from cache first
  let document = await cache.get(cacheKey);
  if (document) {
    // Still need to check permissions
    if (document.projectId) {
      const project = await Project.findById(document.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (!canReadProject(project, req.user)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
    return res.json(document);
  }

  // If not in cache, fetch from database
  document = await Document.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  if (document.projectId) {
    const project = await Project.findById(document.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!canReadProject(project, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  // Cache the document for 10 minutes
  await cache.set(cacheKey, document, 600);

  return res.json(document);
};

export const createDocument = async (req, res) => {
  const { name, content, projectId, projectName, branch, createdBy } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Document name is required" });
  }

  if (projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!canWriteProject(project, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const document = await Document.create({
    name,
    content: content || "",
    projectId: projectId || "",
    projectName: projectName || "",
    branch: branch || "main",
    createdBy: createdBy || req.user.id,
    lastEditedBy: req.user.id,
  });

  // Invalidate cache for document lists
  await cache.invalidatePattern(`documents:*`);

  return res.status(201).json(document);
};

export const updateDocument = async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  if (document.projectId) {
    const project = await Project.findById(document.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!canWriteProject(project, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const { name, content, branch, projectId, projectName } = req.body;

  if (name !== undefined) document.name = name;
  if (content !== undefined) document.content = content;
  if (branch !== undefined) document.branch = branch;
  if (projectId !== undefined) document.projectId = projectId;
  if (projectName !== undefined) document.projectName = projectName;
  document.lastEditedBy = req.user.id;
  document.updatedAt = new Date();

  await document.save();

  // Invalidate cache for this document and document lists
  await cache.del(`document:${req.params.id}`);
  await cache.invalidatePattern(`documents:*`);

  return res.json(document);
};

export const deleteDocument = async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }
  if (document.projectId) {
    const project = await Project.findById(document.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!canWriteProject(project, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  await document.deleteOne();

  // Invalidate cache for this document and document lists
  await cache.del(`document:${req.params.id}`);
  await cache.invalidatePattern(`documents:*`);

  return res.json({ message: "Document deleted" });
};
