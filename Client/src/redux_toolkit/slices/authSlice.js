import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance as axios } from "../../lib/axios";
import { toast } from "react-hot-toast";

import { fetchUsers } from "./userSlice";

const initialState = {
  user: null,
  loading: false,
  error: null,
  isCheckingAuth: false, 
  isUpdatingProfile: false,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/auth/login", formData);
      toast.success("Logged in successfully");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Login failed");
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Login failed"
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/auth/signup", formData);
      toast.success("Account created successfully");
      return res.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Signup failed"
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Signup failed"
      );
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/auth/check-auth");
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Not authenticated";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      await axios.post("/auth/logout");
      return null;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Logout failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateProfileAsync = createAsyncThunk(
  "auth/updateProfile",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post("/auth/update-profile", formData, {
        withCredentials: true,
      });
      toast.success("Profile updated successfully");
      thunkAPI.dispatch(fetchUsers());
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Profile update failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    profilePicPatched: (state, action) => {
      if (state.user) state.user.profilePic = action.payload; 
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
      })

      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
      })

      .addCase(checkAuth.pending, (state) => {
        state.error = null;
        state.isCheckingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isCheckingAuth = false;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.user = null;
        state.error = action.payload;
        state.isCheckingAuth = false;
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfileAsync.pending, (state) => {
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.user = {
          ...state.user,
          profilePic: action.payload.profilePic, 
        };
      })
      .addCase(updateProfileAsync.rejected, (state) => {
        state.isUpdatingProfile = false;
      });
  },
});

export const { clearAuthError, profilePicPatched } = authSlice.actions;
export default authSlice.reducer;
