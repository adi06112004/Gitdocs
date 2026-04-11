// Selectors for collaborator state

export const selectProjectCollaborators = (state, projectId) => {
  return state.collaborators.collaborators[projectId] || [];
};

export const selectCollaboratorsLoading = (state) => {
  return state.collaborators.loading;
};

export const selectCollaboratorsError = (state) => {
  return state.collaborators.error;
};

export const selectCollaboratorInviteLoading = (state) => {
  return state.collaborators.inviteLoading;
};

export const selectCollaboratorInviteError = (state) => {
  return state.collaborators.inviteError;
};

// Get a specific collaborator by userId
export const selectCollaboratorById = (state, projectId, userId) => {
  const collaborators = state.collaborators.collaborators[projectId] || [];
  return collaborators.find((c) => c.userId === userId);
};

// Get collaborators by role
export const selectCollaboratorsByRole = (state, projectId, role) => {
  const collaborators = state.collaborators.collaborators[projectId] || [];
  return collaborators.filter((c) => c.role === role);
};

// Check if a user is a collaborator on a project
export const selectIsCollaborator = (state, projectId, userId) => {
  const collaborators = state.collaborators.collaborators[projectId] || [];
  return collaborators.some((c) => c.userId === userId);
};

// Check if a user has admin access to a project
export const selectHasAdminAccess = (state, projectId, userId) => {
  const collaborators = state.collaborators.collaborators[projectId] || [];
  return collaborators.some((c) => c.userId === userId && c.role === "admin");
};

// Check if a user has write access to a project
export const selectHasWriteAccess = (state, projectId, userId) => {
  const collaborators = state.collaborators.collaborators[projectId] || [];
  return collaborators.some(
    (c) => c.userId === userId && (c.role === "write" || c.role === "admin")
  );
};
