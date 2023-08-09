import { apiSlice } from "./apiSlice";

export const serviceSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addCard: builder.mutation({
      query: (data) => ({
        url: "/api/service/add-card",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useAddCardMutation } = serviceSlice;
