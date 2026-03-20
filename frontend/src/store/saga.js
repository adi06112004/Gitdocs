import { all } from "redux-saga/effects";
import authSaga from "./sagas/authSaga";
import documentSaga from "./sagas/documentSaga";
import versionSaga from "./sagas/versionSaga";
import projectSaga from "./sagas/projectSaga";
import commitSaga from "./sagas/commitSaga";
import userSaga from "./sagas/userSaga";

export default function* rootSaga() {
  yield all([
    authSaga(),
    documentSaga(),
    versionSaga(),
    projectSaga(),
    commitSaga(),
    userSaga(),
  ]);
}