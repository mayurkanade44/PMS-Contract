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
      keepUnusedDataFor: 5,
    }),
    updateContract: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/contract/singleContract/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Contract"],
    }),
  }),
});

export const {
  useCreateContractMutation,
  useGetSingleContractQuery,
  useUpdateContractMutation,
} = contractSlice;
