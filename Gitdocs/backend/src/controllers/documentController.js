import Document from "../models/Document.js";
import Project from "../models/Project.js";
import { canReadProject, canWriteProject } from "../utils/projectPermissions.js";

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

  const documents = await Document.find(filter).sort({ updatedAt: -1 });
  return res.json(documents);
};

export const getDocumentById = async (req, res) => {
  const document = await Document.findById(req.params.id);
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
  return res.json({ message: "Document deleted" });
};
