import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import authReducer from "./slices/authSlice";
import documentReducer from "./slices/documentSlice";
import versionReducer from "./slices/versionSlice";
import projectReducer from "./slices/projectSlice";
import commitReducer from "./slices/commitSlice";
import userReducer from "./slices/userSlice";

import rootSaga from "./saga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentReducer,
    versions: versionReducer,
    projects: projectReducer,
    commits: commitReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);