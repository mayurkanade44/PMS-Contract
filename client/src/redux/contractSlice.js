import { apiSlice } from "./apiSlice";

export const contractSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createContract: builder.mutation({
      query: (data) => ({
        url: "/api/contract",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Contract"],
    }),
    getSingleContract: builder.query({
      query: (id) => ({
        url: `/api/contract/singleContract/${id}`,
      }),
      providesTags: ["Contract"],
      keepUnusedDataFor: 10,
    }),
  }),
});

export const { useCreateContractMutation, useGetSingleContractQuery } =
  contractSlice;
