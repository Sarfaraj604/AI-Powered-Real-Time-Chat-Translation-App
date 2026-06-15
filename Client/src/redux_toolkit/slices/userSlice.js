import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance as axios } from "../../lib/axios";

const moveUserToTop = (users, userId, updates = {}) => {
  const index = users.findIndex((user) => user._id === userId);
  if (index === -1) return;

  const [user] = users.splice(index, 1);
  users.unshift({
    ...user,
    ...updates,
  });
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("/messages/all-users"); 
      return response.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    onlineUsers: [], 
    selectedUser: null,
  },
  reducers: {
    updateUserInList: (state, action) => {
      const updatedUser = action.payload;
      const index = state.users.findIndex((u) => u._id === updatedUser._id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...updatedUser };
      }
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      const previousOnlineUsers = state.onlineUsers;
      state.onlineUsers = action.payload;

      const newlyOnlineUsers = action.payload.filter(
        (userId) => !previousOnlineUsers.includes(userId)
      );

      newlyOnlineUsers.forEach((userId) => {
        moveUserToTop(state.users, userId);
      });
    },
    moveContactToTop: (state, action) => {
      const { userId, latestMessageAt } =
        typeof action.payload === "string"
          ? { userId: action.payload, latestMessageAt: new Date().toISOString() }
          : action.payload;

      moveUserToTop(state.users, userId, { latestMessageAt });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.loading = false;
        state.users = [];
      })
      .addCase("messages/sendMessage/fulfilled", (state, action) => {
        moveUserToTop(state.users, action.payload.receiverId, {
          latestMessageAt: action.payload.createdAt,
        });
      })
      .addCase("messages/addMessage", (state, action) => {
        moveUserToTop(state.users, action.payload.senderId, {
          latestMessageAt: action.payload.createdAt,
        });
      });
  },
});

export const {
  moveContactToTop,
  setSelectedUser,
  setOnlineUsers,
  updateUserInList,
} = userSlice.actions;
export default userSlice.reducer;
