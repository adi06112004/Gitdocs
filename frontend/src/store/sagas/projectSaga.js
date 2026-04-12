import { call, put, select, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  fetchProjectsRequest,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectRequest,
  createProjectSuccess,
  createProjectFailure,
  updateProjectRequest,
  updateProjectSuccess,
  updateProjectFailure,
  deleteProjectRequest,
  deleteProjectSuccess,
  deleteProjectFailure,
} from "../slices/projectSlice";
import { fetchCommitsRequest } from "../slices/commitSlice";
import { projectApiService } from "../../services/ProjectApiService";
import { commitApiService } from "../../services/CommitApiService";

const ROLLBACK_CACHE_KEY = "projectRollbackCache";

const readRollbackCache = () => {
  try {
    return JSON.parse(localStorage.getItem(ROLLBACK_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeRollbackCache = (cache) => {
  localStorage.setItem(ROLLBACK_CACHE_KEY, JSON.stringify(cache));
};

const saveRollbackSnapshot = (projectId, snapshot) => {
  if (!projectId || !snapshot) return;
  const cache = readRollbackCache();
  cache[projectId] = {
    ...snapshot,
    savedAt: new Date().toISOString(),
  };
  writeRollbackCache(cache);
};

const getProjectByIdFromState = (state, projectId) =>
  state.projects.projects.find((p) => p.id === projectId);

function* tryLogCrudActivity(payload) {
  try {
    yield call(commitApiService.createCommit, payload);
  } catch {
    // Keep project CRUD actions non-blocking even if activity logging fails.
  }
}

function* fetchProjects() {
  try {
    const response = yield call(projectApiService.getAllProjects);
    yield put(fetchProjectsSuccess(response));
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(fetchProjectsFailure(message));
    toast.error("Failed to load projects: " + message);
  }
}

function* createProject(action) {
  try {
    const response = yield call(projectApiService.createProject, action.payload);
    yield put(createProjectSuccess(response));
    yield* tryLogCrudActivity({
      message: `Created project: ${response.name}`,
      type: "create",
      projectId: response.id,
      documentId: "project-meta",
      branch: response.currentBranch || "main",
      snapshot: JSON.stringify({
        after: {
          id: response.id,
          name: response.name,
          description: response.description || "",
        },
      }),
    });
    yield put(fetchCommitsRequest());
    toast.success("Project created successfully!");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(createProjectFailure(message));
    toast.error("Failed to create project: " + message);
  }
}

function* updateProject(action) {
  try {
    const { id, data, quiet } = action.payload;
    const existingProject = yield select(getProjectByIdFromState, id);
    if (existingProject) {
      saveRollbackSnapshot(id, {
        action: "update",
        before: {
          id: existingProject.id,
          name: existingProject.name,
          description: existingProject.description || "",
          branches: existingProject.branches || ["main"],
          currentBranch: existingProject.currentBranch || "main",
        },
      });
    }

    const response = yield call(projectApiService.updateProject, id, data);
    yield put(updateProjectSuccess(response));
    yield* tryLogCrudActivity({
      message: `Updated project: ${existingProject?.name || response.name} -> ${response.name}`,
      type: "update",
      projectId: response.id,
      documentId: "project-meta",
      branch: response.currentBranch || "main",
      snapshot: JSON.stringify({
        before: existingProject
          ? {
              id: existingProject.id,
              name: existingProject.name,
              description: existingProject.description || "",
            }
          : null,
        after: {
          id: response.id,
          name: response.name,
          description: response.description || "",
        },
      }),
    });
    yield put(fetchCommitsRequest());
    if (!quiet) {
      toast.success("Project updated successfully!");
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(updateProjectFailure(message));
    toast.error("Failed to update project: " + message);
  }
}

function* deleteProject(action) {
  try {
    const projectId = action.payload;
    const existingProject = yield select(getProjectByIdFromState, projectId);
    if (existingProject) {
      saveRollbackSnapshot(projectId, {
        action: "delete",
        before: {
          id: existingProject.id,
          name: existingProject.name,
          description: existingProject.description || "",
          branches: existingProject.branches || ["main"],
          currentBranch: existingProject.currentBranch || "main",
        },
      });

      yield* tryLogCrudActivity({
        message: `Deleted project: ${existingProject.name}`,
        type: "delete",
        projectId: existingProject.id,
        documentId: "project-meta",
        branch: existingProject.currentBranch || "main",
        snapshot: JSON.stringify({
          before: {
            id: existingProject.id,
            name: existingProject.name,
            description: existingProject.description || "",
          },
        }),
      });
    }

    yield call(projectApiService.deleteProject, projectId);
    yield put(deleteProjectSuccess(projectId));
    yield put(fetchCommitsRequest());
    toast.success("Project deleted successfully!");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(deleteProjectFailure(message));
    toast.error("Failed to delete project: " + message);
  }
}

export default function* projectSaga() {
  yield takeLatest(fetchProjectsRequest.type, fetchProjects);
  yield takeLatest(createProjectRequest.type, createProject);
  yield takeLatest(updateProjectRequest.type, updateProject);
  yield takeLatest(deleteProjectRequest.type, deleteProject);
}