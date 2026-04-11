import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  fetchCommitsRequest,
  fetchCommitsSuccess,
  fetchCommitsFailure,
  createCommitRequest,
  createCommitSuccess,
  createCommitFailure,
} from "../slices/commitSlice";
import { commitApiService } from "../../services/CommitApiService";

function* fetchCommits(action) {
  try {
    const response = yield call(commitApiService.getAllCommits, action.payload || {});
    yield put(fetchCommitsSuccess(response));
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(fetchCommitsFailure(message));
  }
}

function* createCommit(action) {
  try {
    const response = yield call(commitApiService.createCommit, action.payload);
    yield put(createCommitSuccess(response));
    toast.success("Commit created successfully!");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(createCommitFailure(message));
    toast.error("Failed to create commit: " + message);
  }
}

export default function* commitSaga() {
  yield takeLatest(fetchCommitsRequest.type, fetchCommits);
  yield takeLatest(createCommitRequest.type, createCommit);
}
