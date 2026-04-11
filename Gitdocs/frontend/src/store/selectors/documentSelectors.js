import { createSelector } from "@reduxjs/toolkit";

export const selectDocumentsState = (state) => state.documents;

export const selectAllDocuments = createSelector(
  [selectDocumentsState],
  (documents) => documents.documents
);

export const selectCurrentDocument = createSelector(
  [selectDocumentsState],
  (documents) => documents.currentDocument
);

export const selectDocumentsLoading = createSelector(
  [selectDocumentsState],
  (documents) => documents.loading
);

export const selectDocumentsError = createSelector(
  [selectDocumentsState],
  (documents) => documents.error
);