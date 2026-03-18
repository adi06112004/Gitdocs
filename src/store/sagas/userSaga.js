import { call, put, takeLatest } from "redux-saga/effects";

import {
  createUserRequest,
  createUserSuccess,
  createUserFailure,
} from "../slices/userSlice";
import { userApiService } from "../../services/UserApiService";

function* createUser(action) {
  try {
    const response = yield call(userApiService.createUser, action.payload);
    yield put(createUserSuccess(response));
  } catch (error) {
    yield put(createUserFailure(error.message));
  }
}

export default function* userSaga() {
  yield takeLatest(createUserRequest.type, createUser);
}
