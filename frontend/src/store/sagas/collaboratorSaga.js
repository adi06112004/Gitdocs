import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  fetchCollaboratorsRequest,
  fetchCollaboratorsSuccess,
  fetchCollaboratorsFailure,
  inviteCollaboratorRequest,
  inviteCollaboratorSuccess,
  inviteCollaboratorFailure,
  removeCollaboratorRequest,
  removeCollaboratorSuccess,
  removeCollaboratorFailure,
  updateCollaboratorRequest,
  updateCollaboratorSuccess,
  updateCollaboratorFailure,
} from "../slices/collaboratorSlice";
import { collaboratorApiService } from "../../services/CollaboratorApiService";

function* fetchCollaborators(action) {
  try {
    const response = yield call(
      collaboratorApiService.getProjectCollaborators,
      action.payload
    );
    yield put(
      fetchCollaboratorsSuccess({
        projectId: action.payload,
        collaborators: response,
      })
    );
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(fetchCollaboratorsFailure(message));
    // Silently fail for now, as collaborators might not be implemented in backend yet
  }
}

function* inviteCollaborator(action) {
  try {
    const { projectId, data } = action.payload;
    const response = yield call(
      collaboratorApiService.inviteCollaborator,
      projectId,
      data
    );
    yield put(
      inviteCollaboratorSuccess({
        projectId,
        collaborator: response,
      })
    );
    toast.success("Collaborator invited successfully!");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(inviteCollaboratorFailure(message));
    toast.error("Failed to invite collaborator: " + message);
  }
}

function* removeCollaborator(action) {
  try {
    const { projectId, userId } = action.payload;
    yield call(
      collaboratorApiService.removeCollaborator,
      projectId,
      userId
    );
    yield put(
      removeCollaboratorSuccess({
        projectId,
        userId,
      })
    );
    toast.success("Collaborator removed successfully!");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(removeCollaboratorFailure(message));
    toast.error("Failed to remove collaborator: " + message);
  }
}

function* updateCollaborator(action) {
  try {
    const { projectId, userId, data } = action.payload;
    const response = yield call(
      collaboratorApiService.updateCollaborator,
      projectId,
      userId,
      data
    );
    yield put(
      updateCollaboratorSuccess({
        projectId,
        userId,
        updatedData: response,
      })
    );
    toast.success("Collaborator role updated successfully!");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(updateCollaboratorFailure(message));
    toast.error("Failed to update collaborator: " + message);
  }
}

export default function* collaboratorSaga() {
  yield takeLatest(fetchCollaboratorsRequest.type, fetchCollaborators);
  yield takeLatest(inviteCollaboratorRequest.type, inviteCollaborator);
  yield takeLatest(removeCollaboratorRequest.type, removeCollaborator);
  yield takeLatest(updateCollaboratorRequest.type, updateCollaborator);
}
