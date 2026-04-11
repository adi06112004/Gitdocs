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
    updateProjectRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProjectSuccess: (state, action) => {
      state.loading = false;
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], ...action.payload };
        localStorage.setItem("projects", JSON.stringify(state.projects));
      }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = { ...state.currentProject, ...action.payload };
      }
    },
    updateProjectFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteProjectRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteProjectSuccess: (state, action) => {
      state.loading = false;
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
      localStorage.setItem("projects", JSON.stringify(state.projects));
    },
    deleteProjectFailure: (state, action) => {
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
  updateProjectRequest,
  updateProjectSuccess,
  updateProjectFailure,
  deleteProjectRequest,
  deleteProjectSuccess,
  deleteProjectFailure,
  setCurrentProject,
  updateProject,
  addBranchToProject,
  setCurrentBranchForProject,
} = projectSlice.actions;

export default projectSlice.reducer;