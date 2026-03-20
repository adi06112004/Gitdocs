import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { loadAuthFromStorage } from "./store/slices/authSlice";
import { loadProjectsFromStorage as loadProjects } from "./store/slices/projectSlice";
import { loadDocumentsFromStorage as loadDocuments } from "./store/slices/documentSlice";
import { loadBranchesFromStorage as loadBranches } from "./store/slices/versionSlice";
import { loadCommitsFromStorage as loadCommits } from "./store/slices/commitSlice";
import { loadUsersFromStorage as loadUsers } from "./store/slices/userSlice";
import ErrorBoundary from "./components/ErrorBoundary";

// Load initial data from localStorage
store.dispatch(loadAuthFromStorage());
store.dispatch(loadProjects());
store.dispatch(loadDocuments());
store.dispatch(loadBranches());
store.dispatch(loadCommits());
store.dispatch(loadUsers());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
