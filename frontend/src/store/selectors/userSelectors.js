import { createSelector } from "@reduxjs/toolkit";

export const selectUsers = (state) => state.users;

export const selectAllUsers = createSelector(
  [selectUsers],
  (users) => users.users
);

export const selectCurrentUser = createSelector(
  [selectUsers],
  (users) => users.currentUser
);

export const selectUsersLoading = createSelector(
  [selectUsers],
  (users) => users.loading
);

export const selectUsersError = createSelector(
  [selectUsers],
  (users) => users.error
);