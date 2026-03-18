import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  createBranchRequest,
  createBranchSuccess,
  createBranchFailure,
} from "../slices/versionSlice";
import { addBranchToProject } from "../slices/projectSlice";
import { versionApiService } from "../../services/VersionApiService";

function* createBranch(action) {
  try {
    // Branch name validation
    if (!action.payload.name || action.payload.name.trim() === '') {
      throw new Error('Branch name cannot be empty');
    }

    const response = yield call(versionApiService.createVersion, action.payload);
    yield put(createBranchSuccess(response));
    // Add to project
    yield put(addBranchToProject({ projectId: action.payload.projectId, branch: action.payload.name.trim() }));
    toast.success("Branch created successfully!");
  } catch (error) {
    yield put(createBranchFailure(error.message));
    toast.error("Failed to create branch: " + error.message);
  }
}

export default function* versionSaga() {
  yield takeLatest(createBranchRequest.type, createBranch);
}