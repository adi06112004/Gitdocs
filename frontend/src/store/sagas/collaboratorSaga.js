import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  fetchCollaboratorsRequest,
  fetchCollaboratorsSuccess,
  fetchCollaboratorsFailure,
  inviteCollaboratorRequest,
  inviteCollaboratorFailure,
  removeCollaboratorRequest,
  removeCollaboratorFailure,
  updateCollaboratorRequest,
  updateCollaboratorFailure,
} from "../slices/collaboratorSlice";
import { fetchProjectsRequest } from "../slices/projectSlice";
import { collaboratorApiService } from "../../services/CollaboratorApiService";

function normalizeCollaborationResponse(response, projectId) {
  if (response?.members) {
    return {
      projectId,
      collaborators: response.members,
      inviteHistory: response.inviteHistory || [],
    };
  }
  return {
    projectId,
    collaborators: Array.isArray(response) ? response : [],
    inviteHistory: [],
  };
}

function* fetchCollaborators(action) {
  try {
    const response = yield call(
      collaboratorApiService.getProjectCollaborators,
      action.payload,
    );
    yield put(
      fetchCollaboratorsSuccess(
        normalizeCollaborationResponse(response, action.payload),
      ),
    );
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(fetchCollaboratorsFailure(message));
  }
}

function* inviteCollaborator(action) {
  try {
    const { projectId, data } = action.payload;
    const response = yield call(
      collaboratorApiService.inviteCollaborator,
      projectId,
      data,
    );
    yield put(
      fetchCollaboratorsSuccess(
        normalizeCollaborationResponse(response, projectId),
      ),
    );
    yield put(fetchProjectsRequest());
    toast.success("Collaborator added successfully.");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(inviteCollaboratorFailure(message));
    toast.error(message);
  }
}

function* removeCollaborator(action) {
  try {
    const { projectId, userId } = action.payload;
    const response = yield call(
      collaboratorApiService.removeCollaborator,
      projectId,
      userId,
    );
    yield put(
      fetchCollaboratorsSuccess(
        normalizeCollaborationResponse(response, projectId),
      ),
    );
    yield put(fetchProjectsRequest());
    toast.success("Collaborator removed.");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(removeCollaboratorFailure(message));
    toast.error(message);
  }
}

function* updateCollaborator(action) {
  try {
    const { projectId, userId, data } = action.payload;
    const response = yield call(
      collaboratorApiService.updateCollaborator,
      projectId,
      userId,
      data,
    );
    yield put(
      fetchCollaboratorsSuccess(
        normalizeCollaborationResponse(response, projectId),
      ),
    );
    yield put(fetchProjectsRequest());
    toast.success("Role updated.");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(updateCollaboratorFailure(message));
    toast.error(message);
  }
}

export default function* collaboratorSaga() {
  yield takeLatest(fetchCollaboratorsRequest.type, fetchCollaborators);
  yield takeLatest(inviteCollaboratorRequest.type, inviteCollaborator);
  yield takeLatest(removeCollaboratorRequest.type, removeCollaborator);
  yield takeLatest(updateCollaboratorRequest.type, updateCollaborator);
}
