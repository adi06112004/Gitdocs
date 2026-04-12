const normPerm = (p) => String(p || "read").toLowerCase();

export function canReadProject(project, user) {
  if (!project || !user) return false;
  if (project.owner === user.id || user.role === "admin") return true;
  return Boolean(
    project.collaborators?.some((c) => c.userId === user.id),
  );
}

export function canWriteProject(project, user) {
  if (!project || !user) return false;
  if (project.isArchived && !canAdminProject(project, user)) {
    return false;
  }
  if (project.owner === user.id || user.role === "admin") return true;
  const c = project.collaborators?.find((x) => x.userId === user.id);
  if (!c) return false;
  const p = normPerm(c.permission || c.role);
  return p === "write" || p === "admin";
}

export function canAdminProject(project, user) {
  if (!project || !user) return false;
  if (project.owner === user.id || user.role === "admin") return true;
  const c = project.collaborators?.find((x) => x.userId === user.id);
  if (!c) return false;
  return normPerm(c.permission || c.role) === "admin";
}
