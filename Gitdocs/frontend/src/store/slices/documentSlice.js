import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  documents: [],
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    loadDocumentsFromStorage: (state) => {
      const documents = JSON.parse(localStorage.getItem("documents") || "[]");
      state.documents = documents;
    },
    fetchDocumentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDocumentsSuccess: (state, action) => {
      state.loading = false;
      state.documents = action.payload;
      localStorage.setItem("documents", JSON.stringify(state.documents));
    },
    fetchDocumentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createDocumentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createDocumentSuccess: (state, action) => {
      state.loading = false;
      state.documents.unshift(action.payload);
      localStorage.setItem("documents", JSON.stringify(state.documents));
    },
    createDocumentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateDocumentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateDocumentSuccess: (state, action) => {
      state.loading = false;
      const index = state.documents.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.documents[index] = { ...state.documents[index], ...action.payload };
      }
      localStorage.setItem("documents", JSON.stringify(state.documents));
    },
    updateDocumentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteDocument: (state, action) => {
      state.documents = state.documents.filter((d) => d.id !== action.payload);
      localStorage.setItem("documents", JSON.stringify(state.documents));
    },
  },
});

export const {
  loadDocumentsFromStorage,
  fetchDocumentsRequest,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,
  createDocumentRequest,
  createDocumentSuccess,
  createDocumentFailure,
  updateDocumentRequest,
  updateDocumentSuccess,
  updateDocumentFailure,
  deleteDocument,
} = documentSlice.actions;

export default documentSlice.reducer;