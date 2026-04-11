import { createSelector } from "@reduxjs/toolkit";

export const selectProjects = (state) => state.projects;

export const selectAllProjects = createSelector(
  [selectProjects],
  (projects) => projects.projects
);

export const selectCurrentProject = createSelector(
  [selectProjects],
  (projects) => projects.currentProject
);

export const selectProjectsLoading = createSelector(
  [selectProjects],
  (projects) => projects.loading
);

export const selectProjectsError = createSelector(
  [selectProjects],
  (projects) => projects.error
);