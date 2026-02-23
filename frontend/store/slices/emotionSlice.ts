import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AnalyzeFrameResponse } from "../services/emotionApi";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;


interface EmotionState {
  dominant_emotion: string | null;
  emotions: Record<string, number>;
  loading: boolean;
  error: string | null;
}

const initialState: EmotionState = {
  dominant_emotion: null,
  emotions: {},
  loading: false,
  error: null,
};

export const analyzeFrame = createAsyncThunk<
  AnalyzeFrameResponse,
  string, 
  { rejectValue: string }
>("emotion/analyzeFrame", async (base64Image, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/analyze-frame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const err = await response.json();
      return rejectWithValue(err.detail ?? "Server error");
    }

    return (await response.json()) as AnalyzeFrameResponse;
  } catch (error) {
    return rejectWithValue("Network error — is the API running?");
  }
});

const emotionSlice = createSlice({
  name: "emotion",
  initialState,
  reducers: {
    resetEmotion: (state) => {
      state.dominant_emotion = null;
      state.emotions = {};
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeFrame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeFrame.fulfilled, (state, action: PayloadAction<AnalyzeFrameResponse>) => {
        state.loading = false;
        state.dominant_emotion = action.payload.dominant_emotion;
        state.emotions = action.payload.emotions;
      })
      .addCase(analyzeFrame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export const { resetEmotion } = emotionSlice.actions;
export default emotionSlice.reducer;