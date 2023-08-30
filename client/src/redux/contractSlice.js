import { apiSlice } from "./apiSlice";

export const contractSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createContract: builder.mutation({
      query: (data) => ({
        url: "/api/contract",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Contracts"],
    }),
    getSingleContract: builder.query({
      query: (id) => ({
        url: `/api/contract/singleContract/${id}`,
      }),
      providesTags: ["Contract"],
      keepUnusedDataFor: 10,
    }),
    updateContract: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/contract/singleContract/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Contract", "Contracts"],
    }),
    deleteContract: builder.mutation({
      query: (id) => ({
        url: `/api/contract/singleContract/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contracts"],
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
      providesTags: ["Contracts"],
      keepUnusedDataFor: 10,
    }),
    getAllValues: builder.query({
      query: () => ({
        url: "/api/contract/getAllValues",
      }),
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
  useGetAllValuesQuery,
} = contractSlice;
