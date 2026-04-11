import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  fetchVersionsRequest,
  fetchVersionsSuccess,
  fetchVersionsFailure,
  createVersionRequest,
  createVersionSuccess,
  createVersionFailure,
  deleteVersionRequest,
  deleteVersionSuccess,
  deleteVersionFailure,
} from "../slices/versionSlice";
import {
  addBranchToProject,
  setCurrentBranchForProject,
} from "../slices/projectSlice";
import { versionApiService } from "../../services/VersionApiService";

function* fetchVersions() {
  try {
    const response = yield call(versionApiService.getAllVersions);
    yield put(fetchVersionsSuccess(response));
  } catch (error) {
    yield put(fetchVersionsFailure(error.message));
  }
}

function* createVersion(action) {
  try {
    if (!action.payload.name || action.payload.name.trim() === '') {
      throw new Error('Branch name cannot be empty');
    }

    const response = yield call(versionApiService.createVersion, action.payload);
    yield put(createVersionSuccess(response));

    if (response && response.projectId && response.name) {
      yield put(
        addBranchToProject({
          projectId: response.projectId,
          branch: response.name,
        }),
      );
      yield put(
        setCurrentBranchForProject({
          projectId: response.projectId,
          branch: response.name,
        }),
      );
    }

    toast.success("Branch created successfully!");
  } catch (error) {
    yield put(createVersionFailure(error.message));
    toast.error("Failed to create branch: " + error.message);
  }
}

function* deleteVersion(action) {
  try {
    yield call(versionApiService.deleteVersion, action.payload);
    yield put(deleteVersionSuccess(action.payload));
    toast.success("Branch deleted successfully!");
  } catch (error) {
    yield put(deleteVersionFailure(error.message));
    toast.error("Failed to delete branch: " + error.message);
  }
}

export default function* versionSaga() {
  yield takeLatest(fetchVersionsRequest.type, fetchVersions);
  yield takeLatest(createVersionRequest.type, createVersion);
  yield takeLatest(deleteVersionRequest.type, deleteVersion);
}