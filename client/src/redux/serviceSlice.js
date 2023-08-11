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
    deleteCard: builder.mutation({
      query: (id) => ({
        url: `/api/service/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useAddCardMutation, useDeleteCardMutation } = serviceSlice;
