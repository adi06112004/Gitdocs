import { call, put, takeLatest } from "redux-saga/effects";

import {
  createCommitRequest,
  createCommitSuccess,
  createCommitFailure,
} from "../slices/commitSlice";
import { commitApiService } from "../../services/CommitApiService";

function* createCommit(action) {
  try {
    const response = yield call(commitApiService.createCommit, action.payload);
    yield put(createCommitSuccess(response));
  } catch (error) {
    yield put(createCommitFailure(error.message));
  }
}

export default function* commitSaga() {
  yield takeLatest(createCommitRequest.type, createCommit);
}
