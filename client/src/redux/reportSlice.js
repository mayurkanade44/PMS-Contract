import { apiSlice } from "./apiSlice";

export const reportSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addReportData: builder.mutation({
      query: (data) => ({
        url: "/api/report/add",
        method: "POST",
        body: data,
      }),
    }),
    generateReport: builder.mutation({
      query: (data) => ({
        url: `/api/report/generate`,
        method: "POST",
        body: data,
      }),
    }),
    getClientReport: builder.query({
      query: (id) => ({
        url: `/api/report/clientReport/${id}`,
      }),
    }),
  }),
});

export const {
  useAddReportDataMutation,
  useGenerateReportMutation,
  useGetClientReportQuery,
} = reportSlice;
