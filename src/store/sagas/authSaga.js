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

// Simulate API-based auth
function* loginUser(action) {
  try {
    const response = yield call(authApiService.login, action.payload);
    yield put(loginSuccess(response));
    toast.success("Login successful!");
  } catch (error) {
    yield put(loginFailure(error.message));
    toast.error("Login failed: " + error.message);
  }
}

function* signupUser(action) {
  try {
    // Assuming signup is handled via API, but since it's not in AuthApiService, use createUser from UserApiService
    // For now, keep localStorage or add to AuthApiService
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === action.payload.email);

    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: Date.now(),
      name: action.payload.name,
      email: action.payload.email,
      password: action.payload.password,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    const token = `token_${newUser.id}_${Date.now()}`;
    yield put(signupSuccess({ user: { id: newUser.id, name: newUser.name, email: newUser.email }, token }));
    toast.success("Account created successfully!");
  } catch (error) {
    yield put(signupFailure(error.message));
    toast.error("Signup failed: " + error.message);
  }
}

export default function* authSaga() {
  yield takeLatest(loginRequest.type, loginUser);
  yield takeLatest(signupRequest.type, signupUser);
}