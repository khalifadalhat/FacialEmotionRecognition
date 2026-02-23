import { configureStore } from "@reduxjs/toolkit";
import { emotionApi } from "./services/emotionApi";
import emotionReducer from "./slices/emotionSlice";

export const store = configureStore({
  reducer: {
    emotion: emotionReducer,
    [emotionApi.reducerPath]: emotionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(emotionApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;