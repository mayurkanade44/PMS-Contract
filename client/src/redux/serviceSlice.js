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
    updateCard: builder.mutation({
      query: (data) => ({
        url: `/api/service/${data.id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteCard: builder.mutation({
      query: (id) => ({
        url: `/api/service/${id}`,
        method: "DELETE",
      }),
    }),
    createCard: builder.mutation({
      query: (id) => ({
        url: `/api/service/create-card/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Contract"],
    }),
    singleCard: builder.query({
      query: (id) => ({
        url: `/api/service/${id}`,
      }),
    }),
  }),
});

export const {
  useAddCardMutation,
  useDeleteCardMutation,
  useUpdateCardMutation,
  useCreateCardMutation,
  useSingleCardQuery,
} = serviceSlice;
