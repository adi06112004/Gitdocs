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
      const branches = JSON.parse(localStorage.getItem('branches') || '["main"]');
      state.branches = branches;
    },
    createBranchRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createBranchSuccess: (state, action) => {
      state.loading = false;
      if (!state.branches.includes(action.payload)) {
        state.branches.push(action.payload);
        localStorage.setItem('branches', JSON.stringify(state.branches));
      }
    },
    createBranchFailure: (state, action) => {
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
  createBranchRequest,
  createBranchSuccess,
  createBranchFailure,
  setCurrentBranch,
} = versionSlice.actions;

export default versionSlice.reducer;