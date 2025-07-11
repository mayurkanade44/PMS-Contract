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
      query: ({
        paymentStatus,
        billType,
        search,
        paymentMode,
        month,
        isCancelled,
        page,
        sales,
      }) => ({
        url: `/api/billing`,
        params: {
          paymentStatus,
          billType,
          search,
          paymentMode,
          month,
          isCancelled,
          page,
          sales,
        },
      }),
      providesTags: ["Bills"],
      keepUnusedDataFor: 10,
    }),
    searchBill: builder.query({
      query: ({ search }) => ({
        url: `/api/billing/searchBill`,
        params: { search },
      }),
    }),
    cancelInvoice: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/billing/cancelInvoice/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Bills"],
    }),
    getMonthlyInvoiceStats: builder.query({
      query: ({month}) => ({
        url: `/api/billing/invoice-stats`,
        params: {month}
      }),
      providesTags: ["Bills"],
    }),
    convertToTaxInvoice: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/billing/convert-to-taxinvoice/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Bills"],
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
  useCancelInvoiceMutation,
  useGetMonthlyInvoiceStatsQuery,
  useConvertToTaxInvoiceMutation,
} = billingSlice;
