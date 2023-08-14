import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  contractDetails: null,
};

const allSlice = createSlice({
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
    setContractDetails: (state, action) => {
      state.contractDetails = action.payload;
    },
    removeContractDetails: (state) => {
      state.contractDetails = null;
    },
  },
});

export const {
  setCredentials,
  removeCredentials,
  setContractDetails,
  removeContractDetails,
} = allSlice.actions;

export default allSlice.reducer;
