import { createSelector } from "@reduxjs/toolkit";

export const selectCommits = (state) => state.commits;

export const selectAllCommits = createSelector(
  [selectCommits],
  (commits) => commits.commits
);

export const selectCurrentCommit = createSelector(
  [selectCommits],
  (commits) => commits.currentCommit
);

export const selectCommitsLoading = createSelector(
  [selectCommits],
  (commits) => commits.loading
);

export const selectCommitsError = createSelector(
  [selectCommits],
  (commits) => commits.error
);
