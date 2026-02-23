import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface AnalyzeFrameRequest {
  image: string;
}

export interface AnalyzeFrameResponse {
  success: boolean;
  dominant_emotion: string;
  emotions: Record<string, number>;
}

export const emotionApi = createApi({
  reducerPath: "emotionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL!, 
  }),
  endpoints: (builder) => ({
    analyzeFrame: builder.mutation<AnalyzeFrameResponse, AnalyzeFrameRequest>({
      query: (body) => ({
        url: "/analyze-frame",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useAnalyzeFrameMutation } = emotionApi;