import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  collaborators: {},
  inviteHistory: {},
  loading: false,
  error: null,
  inviteLoading: false,
  inviteError: null,
};

const collaboratorSlice = createSlice({
  name: "collaborators",
  initialState,
  reducers: {
    fetchCollaboratorsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCollaboratorsSuccess: (state, action) => {
      state.loading = false;
      state.inviteLoading = false;
      const { projectId, collaborators, inviteHistory } = action.payload;
      state.collaborators[projectId] = collaborators;
      if (inviteHistory !== undefined) {
        state.inviteHistory[projectId] = inviteHistory;
      }
    },
    fetchCollaboratorsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    inviteCollaboratorRequest: (state) => {
      state.inviteLoading = true;
      state.inviteError = null;
    },
    inviteCollaboratorFailure: (state, action) => {
      state.inviteLoading = false;
      state.inviteError = action.payload;
    },

    removeCollaboratorRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeCollaboratorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateCollaboratorRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateCollaboratorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

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
  inviteCollaboratorFailure,
  removeCollaboratorRequest,
  removeCollaboratorFailure,
  updateCollaboratorRequest,
  updateCollaboratorFailure,
  clearError,
} = collaboratorSlice.actions;

export default collaboratorSlice.reducer;
