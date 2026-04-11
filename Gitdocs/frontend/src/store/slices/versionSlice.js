import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  branches: [],
  currentBranch: 'main',
  loading: false,
  error: null,
};

const versionSlice = createSlice({
  name: "versions",
  initialState,
  reducers: {
    loadBranchesFromStorage: (state) => {
      const branches = JSON.parse(localStorage.getItem('branches') || '[]');
      state.branches = branches;
    },
    fetchVersionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVersionsSuccess: (state, action) => {
      state.loading = false;
      state.branches = action.payload;
      localStorage.setItem('branches', JSON.stringify(state.branches));
    },
    fetchVersionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createVersionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createVersionSuccess: (state, action) => {
      state.loading = false;
      state.branches.push(action.payload);
      localStorage.setItem('branches', JSON.stringify(state.branches));
    },
    createVersionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteVersionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteVersionSuccess: (state, action) => {
      state.loading = false;
      state.branches = state.branches.filter(b => b.id !== action.payload);
      localStorage.setItem('branches', JSON.stringify(state.branches));
    },
    deleteVersionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentBranch: (state, action) => {
      state.currentBranch = action.payload;
    },
  },
});

export const {
  loadBranchesFromStorage,
  fetchVersionsRequest,
  fetchVersionsSuccess,
  fetchVersionsFailure,
  createVersionRequest,
  createVersionSuccess,
  createVersionFailure,
  deleteVersionRequest,
  deleteVersionSuccess,
  deleteVersionFailure,
  setCurrentBranch,
} = versionSlice.actions;

export default versionSlice.reducer;