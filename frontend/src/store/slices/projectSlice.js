import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    loadProjectsFromStorage: (state) => {
      const projects = JSON.parse(localStorage.getItem("projects") || "[]");
      state.projects = projects.map((p) => ({
        ...p,
        branches: p.branches || ["main"],
        currentBranch: p.currentBranch || "main",
      }));
    },
    fetchProjectsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (state, action) => {
      state.loading = false;
      state.projects = action.payload.map((project) => ({
        ...project,
        branches: project.branches || ["main"],
        currentBranch: project.currentBranch || "main",
        collaborators: project.collaborators || [],
      }));
      localStorage.setItem("projects", JSON.stringify(state.projects));
    },
    fetchProjectsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createProjectRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createProjectSuccess: (state, action) => {
      state.loading = false;
      state.projects.unshift(action.payload);
      localStorage.setItem("projects", JSON.stringify(state.projects));
    },
    createProjectFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    updateProject: (state, action) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], ...action.payload };
        localStorage.setItem("projects", JSON.stringify(state.projects));
      }
    },
    addBranchToProject: (state, action) => {
      const { projectId, branch } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project && !project.branches.includes(branch)) {
        project.branches.push(branch);
        localStorage.setItem("projects", JSON.stringify(state.projects));
      }
    },
    setCurrentBranchForProject: (state, action) => {
      const { projectId, branch } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        project.currentBranch = branch;
        localStorage.setItem("projects", JSON.stringify(state.projects));
      }
    },
    updateProjectCollaborators: (state, action) => {
      const { projectId, collaborators } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        project.collaborators = collaborators;
        localStorage.setItem("projects", JSON.stringify(state.projects));
      }
    },
    addProjectCollaborator: (state, action) => {
      const { projectId, collaborator } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project && !project.collaborators) {
        project.collaborators = [];
      }
      if (project && !project.collaborators.find((c) => c.userId === collaborator.userId)) {
        project.collaborators.push(collaborator);
        localStorage.setItem("projects", JSON.stringify(state.projects));
      }
    },
    removeProjectCollaborator: (state, action) => {
      const { projectId, userId } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project && project.collaborators) {
        project.collaborators = project.collaborators.filter(
          (c) => c.userId !== userId
        );
        localStorage.setItem("projects", JSON.stringify(state.projects));
      }
    },
  },
});

export const {
  loadProjectsFromStorage,
  fetchProjectsRequest,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectRequest,
  createProjectSuccess,
  createProjectFailure,
  setCurrentProject,
  updateProject,
  addBranchToProject,
  setCurrentBranchForProject,
  updateProjectCollaborators,
  addProjectCollaborator,
  removeProjectCollaborator,
} = projectSlice.actions;

export default projectSlice.reducer;