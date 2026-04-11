import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  collaborators: {},  // { projectId: [{ id, userId, username, email, role, createdAt }, ...] }
  loading: false,
  error: null,
  inviteLoading: false,
  inviteError: null,
};

const collaboratorSlice = createSlice({
  name: "collaborators",
  initialState,
  reducers: {
    // Fetch collaborators for a project
    fetchCollaboratorsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCollaboratorsSuccess: (state, action) => {
      state.loading = false;
      const { projectId, collaborators } = action.payload;
      state.collaborators[projectId] = collaborators;
    },
    fetchCollaboratorsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Invite collaborator
    inviteCollaboratorRequest: (state) => {
      state.inviteLoading = true;
      state.inviteError = null;
    },
    inviteCollaboratorSuccess: (state, action) => {
      state.inviteLoading = false;
      const { projectId, collaborator } = action.payload;
      if (!state.collaborators[projectId]) {
        state.collaborators[projectId] = [];
      }
      state.collaborators[projectId].push(collaborator);
    },
    inviteCollaboratorFailure: (state, action) => {
      state.inviteLoading = false;
      state.inviteError = action.payload;
    },

    // Remove collaborator
    removeCollaboratorRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeCollaboratorSuccess: (state, action) => {
      state.loading = false;
      const { projectId, userId } = action.payload;
      if (state.collaborators[projectId]) {
        state.collaborators[projectId] = state.collaborators[projectId].filter(
          (c) => c.userId !== userId
        );
      }
    },
    removeCollaboratorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update collaborator role
    updateCollaboratorRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateCollaboratorSuccess: (state, action) => {
      state.loading = false;
      const { projectId, userId, updatedData } = action.payload;
      if (state.collaborators[projectId]) {
        const collaborator = state.collaborators[projectId].find(
          (c) => c.userId === userId
        );
        if (collaborator) {
          Object.assign(collaborator, updatedData);
        }
      }
    },
    updateCollaboratorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
      state.inviteError = null;
    },
  },
});

export const {
  fetchCollaboratorsRequest,
  fetchCollaboratorsSuccess,
  fetchCollaboratorsFailure,
  inviteCollaboratorRequest,
  inviteCollaboratorSuccess,
  inviteCollaboratorFailure,
  removeCollaboratorRequest,
  removeCollaboratorSuccess,
  removeCollaboratorFailure,
  updateCollaboratorRequest,
  updateCollaboratorSuccess,
  updateCollaboratorFailure,
  clearError,
} = collaboratorSlice.actions;

export default collaboratorSlice.reducer;
