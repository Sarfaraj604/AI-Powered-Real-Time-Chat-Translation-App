import { createSlice } from "@reduxjs/toolkit";

const savedLanguage = localStorage.getItem("preferredLanguage") || "en";

const languageSlice = createSlice({
  name: "language",
  initialState: {
    selectedLanguage: savedLanguage,
  },
  reducers: {
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
      localStorage.setItem("preferredLanguage", action.payload);
    },
  },
});

export const { setSelectedLanguage } = languageSlice.actions;
export default languageSlice.reducer;
