import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  contractDetails: null,
  scheduleDetails: null,
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
    setScheduleDetails: (state, action) => {
      state.scheduleDetails = action.payload;
    },
    removeScheduleDetails: (state) => {
      state.scheduleDetails = null;
    },
  },
});

export const {
  setCredentials,
  removeCredentials,
  setContractDetails,
  removeContractDetails,
  setScheduleDetails,
  removeScheduleDetails,
} = allSlice.actions;

export default allSlice.reducer;
