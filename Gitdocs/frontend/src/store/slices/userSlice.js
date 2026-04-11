import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    loadUsersFromStorage: (state) => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      state.users = users;
    },
    createUserRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createUserSuccess: (state, action) => {
      state.loading = false;
      state.users.push(action.payload);
      localStorage.setItem('users', JSON.stringify(state.users));
    },
    createUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
        localStorage.setItem('users', JSON.stringify(state.users));
      }
    },
  },
});

export const {
  loadUsersFromStorage,
  createUserRequest,
  createUserSuccess,
  createUserFailure,
  setCurrentUser,
  updateUser,
} = userSlice.actions;

export default userSlice.reducer;