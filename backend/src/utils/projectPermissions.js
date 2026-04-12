export const normalizePermission = (permission) => {
  const value = (permission || "read").toLowerCase();
  if (["read", "write", "admin"].includes(value)) {
    return value;
  }
  return "read";
};

const getCollaborator = (project, userId) => {
  if (!project || !Array.isArray(project.collaborators)) {
    return null;
  }
  return project.collaborators.find((c) => c.userId === userId) || null;
};

export const canReadProject = (project, user) => {
  if (!project || !user) return false;
  if (project.owner === user.id || user.role === "admin") return true;
  return Boolean(getCollaborator(project, user.id));
};

export const canWriteProject = (project, user) => {
  if (!project || !user) return false;
  if (project.isArchived && !canAdminProject(project, user)) {
    return false;
  }
  if (project.owner === user.id || user.role === "admin") return true;
  const collaborator = getCollaborator(project, user.id);
  if (!collaborator) return false;
  const permission = normalizePermission(collaborator.permission);
  return permission === "write" || permission === "admin";
};

export const canAdminProject = (project, user) => {
  if (!project || !user) return false;
  if (project.owner === user.id || user.role === "admin") return true;
  const collaborator = getCollaborator(project, user.id);
  if (!collaborator) return false;
  return normalizePermission(collaborator.permission) === "admin";
};

export const sanitizeCollaborators = (collaborators = []) => {
  return collaborators.map((c) => ({
    userId: c.userId,
    permission: normalizePermission(c.permission),
  }));
};
