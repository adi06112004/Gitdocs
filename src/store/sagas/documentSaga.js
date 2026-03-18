import { call, put, takeLatest } from "redux-saga/effects";

import {
  createDocumentRequest,
  createDocumentSuccess,
  createDocumentFailure,
} from "../slices/documentSlice";
import { documentApiService } from "../../services/DocumentApiService";

function* createDocument(action) {
  try {
    const response = yield call(documentApiService.createDocument, action.payload);
    yield put(createDocumentSuccess(response));
  } catch (error) {
    yield put(createDocumentFailure(error.message));
  }
}

export default function* documentSaga() {
  yield takeLatest(createDocumentRequest.type, createDocument);
}