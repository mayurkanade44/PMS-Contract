import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    removeCredentials: (state, action) => {
      state.user = null;
      localStorage.clear();
    },
  },
});

export const { setCredentials, removeCredentials } = authSlice.actions;

export default authSlice.reducer;
