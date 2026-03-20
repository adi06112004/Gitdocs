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
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      // Ensure each project has branches and currentBranch
      state.projects = projects.map(p => ({
        ...p,
        branches: p.branches || ['main'],
        currentBranch: p.currentBranch || 'main',
      }));
    },
    createProjectRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createProjectSuccess: (state, action) => {
      state.loading = false;
      state.projects.push(action.payload);
      localStorage.setItem('projects', JSON.stringify(state.projects));
    },
    createProjectFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    updateProject: (state, action) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], ...action.payload };
        localStorage.setItem('projects', JSON.stringify(state.projects));
      }
    },
    addBranchToProject: (state, action) => {
      const { projectId, branch } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project && !project.branches.includes(branch)) {
        project.branches.push(branch);
        localStorage.setItem('projects', JSON.stringify(state.projects));
      }
    },
    setCurrentBranchForProject: (state, action) => {
      const { projectId, branch } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        project.currentBranch = branch;
        localStorage.setItem('projects', JSON.stringify(state.projects));
      }
    },
  },
});

export const {
  loadProjectsFromStorage,
  createProjectRequest,
  createProjectSuccess,
  createProjectFailure,
  setCurrentProject,
  updateProject,
  addBranchToProject,
  setCurrentBranchForProject,
} = projectSlice.actions;

export default projectSlice.reducer;