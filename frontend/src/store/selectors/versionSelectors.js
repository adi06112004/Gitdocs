import { createSelector } from "@reduxjs/toolkit";

export const selectVersions = (state) => state.versions;

export const selectAllVersions = createSelector(
  [selectVersions],
  (versions) => versions.versions
);

export const selectCurrentVersion = createSelector(
  [selectVersions],
  (versions) => versions.currentVersion
);

export const selectVersionsLoading = createSelector(
  [selectVersions],
  (versions) => versions.loading
);

export const selectVersionsError = createSelector(
  [selectVersions],
  (versions) => versions.error
);
