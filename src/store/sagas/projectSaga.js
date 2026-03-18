import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  createProjectRequest,
  createProjectSuccess,
  createProjectFailure,
} from "../slices/projectSlice";
import { projectApiService } from "../../services/ProjectApiService";

function* createProject(action) {
  try {
    const newProject = {
      id: Date.now(),
      name: action.payload.name,
      description: action.payload.description || 'Git-aware document repository',
      createdAt: new Date().toISOString(),
      branches: ['main'],
      currentBranch: 'main',
      documents: [],
    };
    const response = yield call(projectApiService.createProject, newProject);
    yield put(createProjectSuccess(response));
    toast.success("Project created successfully!");
  } catch (error) {
    yield put(createProjectFailure(error.message));
    toast.error("Failed to create project: " + error.message);
  }
}

export default function* projectSaga() {
  yield takeLatest(createProjectRequest.type, createProject);
}