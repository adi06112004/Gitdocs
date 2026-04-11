import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  loginRequest,
  loginSuccess,
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure,
} from "../slices/authSlice";
import { authApiService } from "../../services/AuthApiService";

function* loginUser(action) {
  try {
    const response = yield call(authApiService.login, action.payload);
    yield put(loginSuccess(response));
    toast.success("Login successful!");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(loginFailure(message));
    toast.error("Login failed: " + message);
  }
}

function* signupUser(action) {
  try {
    const response = yield call(authApiService.register, action.payload);
    yield put(signupSuccess(response));
    toast.success("Account created successfully!");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(signupFailure(message));
    toast.error("Signup failed: " + message);
  }
}

export default function* authSaga() {
  yield takeLatest(loginRequest.type, loginUser);
  yield takeLatest(signupRequest.type, signupUser);
}