import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance as axios } from "../../lib/axios";

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(`/messages/${userId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ receiverId, text, image }, thunkAPI) => {
    try {
      const response = await axios.post(`/messages/send/${receiverId}`, {
        text,
        image,
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

export const translateMessage = createAsyncThunk(
  "messages/translateMessage",
  async ({ messageId, targetLanguage }, thunkAPI) => {
    try {
      const response = await axios.post(`/messages/translate/${messageId}`, {
        targetLanguage,
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        messageId,
        targetLanguage,
        message:
          error.response?.data?.message || "Failed to translate message",
      });
    }
  },
  {
    condition: ({ messageId, targetLanguage }, { getState }) => {
      const { messages } = getState().messages;
      const message = messages.find((item) => item._id === messageId);

      if (!message?.text) return false;

      const hasTranslation = Boolean(message.translations?.[targetLanguage]);
      const translationStatus = message.translationStatus?.[targetLanguage];
      const hasRequestFinished = translationStatus === "loading";

      return !hasTranslation && !hasRequestFinished;
    },
  }
);

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    resetMessageTranslationError: (state, action) => {
      const { messageId, targetLanguage } = action.payload;
      const message = state.messages.find((item) => item._id === messageId);

      if (message?.translationStatus?.[targetLanguage] === "error") {
        message.translationStatus[targetLanguage] = undefined;
        message.translationError = {
          ...(message.translationError || {}),
          [targetLanguage]: undefined,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(translateMessage.pending, (state, action) => {
        const { messageId, targetLanguage } = action.meta.arg;
        const message = state.messages.find((item) => item._id === messageId);

        if (message) {
          message.translationStatus = {
            ...(message.translationStatus || {}),
            [targetLanguage]: "loading",
          };
        }
      })
      .addCase(translateMessage.fulfilled, (state, action) => {
        const { messageId, targetLanguage, translatedText } = action.payload;
        const message = state.messages.find((item) => item._id === messageId);

        if (message) {
          message.translations = {
            ...(message.translations || {}),
            [targetLanguage]: translatedText,
          };
          message.translationStatus = {
            ...(message.translationStatus || {}),
            [targetLanguage]: "ready",
          };
        }
      })
      .addCase(translateMessage.rejected, (state, action) => {
        const { messageId, targetLanguage, message: errorMessage } =
          action.payload || action.meta.arg;
        const message = state.messages.find((item) => item._id === messageId);

        if (message) {
          message.translationStatus = {
            ...(message.translationStatus || {}),
            [targetLanguage]: "error",
          };
          message.translationError = {
            ...(message.translationError || {}),
            [targetLanguage]: errorMessage || "Failed to translate message",
          };
        }
      });
  },
});

export const { addMessage, resetMessageTranslationError } =
  messageSlice.actions;

export default messageSlice.reducer;
