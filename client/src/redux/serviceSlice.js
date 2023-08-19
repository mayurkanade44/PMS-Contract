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
    sendContract: builder.mutation({
      query: (id) => ({
        url: `/api/service/send-contract/${id}`,
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
  useSendContractMutation,
  useSingleCardQuery,
} = serviceSlice;
