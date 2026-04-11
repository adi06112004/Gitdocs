import { call, put, takeLatest } from "redux-saga/effects";

import {
  fetchDocumentsRequest,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,
  createDocumentRequest,
  createDocumentSuccess,
  createDocumentFailure,
  updateDocumentRequest,
  updateDocumentSuccess,
  updateDocumentFailure,
} from "../slices/documentSlice";
import { documentApiService } from "../../services/DocumentApiService";

function* fetchDocuments() {
  try {
    const response = yield call(documentApiService.getAllDocuments);
    yield put(fetchDocumentsSuccess(response));
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(fetchDocumentsFailure(message));
  }
}

function* createDocument(action) {
  try {
    const response = yield call(documentApiService.createDocument, action.payload);
    yield put(createDocumentSuccess(response));
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(createDocumentFailure(message));
  }
}

function* updateDocument(action) {
  try {
    const response = yield call(
      documentApiService.updateDocument,
      action.payload.id,
      action.payload,
    );
    yield put(updateDocumentSuccess(response));
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(updateDocumentFailure(message));
  }
}

export default function* documentSaga() {
  yield takeLatest(fetchDocumentsRequest.type, fetchDocuments);
  yield takeLatest(createDocumentRequest.type, createDocument);
  yield takeLatest(updateDocumentRequest.type, updateDocument);
}