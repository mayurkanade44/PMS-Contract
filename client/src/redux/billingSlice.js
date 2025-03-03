import { apiSlice } from "./apiSlice";

export const billingSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addBilling: builder.mutation({
      query: (data) => ({
        url: "/api/billing/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Bills"],
    }),
    generateInvoice: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/billing/invoice/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Bills"],
    }),
    getSingleBill: builder.query({
      query: (id) => ({
        url: `/api/billing/singleBill/${id}`,
      }),
      providesTags: ["Bills"],
      keepUnusedDataFor: 10,
    }),
    updateBillDetails: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/billing/singleBill/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Bills"],
    }),
    updateInvoice: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/billing/invoice/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Bills"],
    }),
    getAllInvoices: builder.query({
      query: ({ paymentStatus, billType, search, page }) => ({
        url: `/api/billing`,
        params: {
          paymentStatus,
          billType,
          search,
          page,
        },
      }),
      providesTags: ["Bills"],
      keepUnusedDataFor: 10,
    }),
    searchBill: builder.query({
      query: ({ search }) => ({
        url: `/api/billing/searchBill`,
        params: {search},
      }),
    }),
  }),
});

export const {
  useAddBillingMutation,
  useGenerateInvoiceMutation,
  useGetSingleBillQuery,
  useUpdateBillDetailsMutation,
  useUpdateInvoiceMutation,
  useGetAllInvoicesQuery,
  useSearchBillQuery,
} = billingSlice;
