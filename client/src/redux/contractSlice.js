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
    deleteContract: builder.mutation({
      query: (id) => ({
        url: `/api/contract/singleContract/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contract"],
    }),
    deactiveContract: builder.mutation({
      query: (id) => ({
        url: `/api/contract/deactive/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Contract"],
    }),
    getAllContracts: builder.query({
      query: ({ search, page }) => ({
        url: `/api/contract`,
        params: { search, page },
      }),
      providesTags: ["Contract"],
      keepUnusedDataFor: 10,
    }),
  }),
});

export const {
  useCreateContractMutation,
  useGetSingleContractQuery,
  useUpdateContractMutation,
  useDeleteContractMutation,
  useDeactiveContractMutation,
  useGetAllContractsQuery,
} = contractSlice;
