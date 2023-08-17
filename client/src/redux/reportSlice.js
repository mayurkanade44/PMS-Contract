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
  }),
});

export const { useAddReportDataMutation, useGenerateReportMutation } =
  reportSlice;
