import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  commits: [],
  currentCommit: null,
  loading: false,
  error: null,
};

const commitSlice = createSlice({
  name: "commits",
  initialState,
  reducers: {
    loadCommitsFromStorage: (state) => {
      const commits = JSON.parse(localStorage.getItem('commits') || '[]');
      state.commits = commits;
    },
    fetchCommitsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCommitsSuccess: (state, action) => {
      state.loading = false;
      state.commits = action.payload;
      localStorage.setItem('commits', JSON.stringify(state.commits));
    },
    fetchCommitsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createCommitRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createCommitSuccess: (state, action) => {
      state.loading = false;
      state.commits.unshift(action.payload);
      localStorage.setItem('commits', JSON.stringify(state.commits));
    },
    createCommitFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentCommit: (state, action) => {
      state.currentCommit = action.payload;
    },
    updateCommit: (state, action) => {
      const index = state.commits.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.commits[index] = { ...state.commits[index], ...action.payload };
      }
    },
  },
});

export const {
  loadCommitsFromStorage,
  fetchCommitsRequest,
  fetchCommitsSuccess,
  fetchCommitsFailure,
  createCommitRequest,
  createCommitSuccess,
  createCommitFailure,
  setCurrentCommit,
  updateCommit,
} = commitSlice.actions;

export default commitSlice.reducer;
