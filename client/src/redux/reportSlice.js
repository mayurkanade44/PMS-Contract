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
    dailyServices: builder.query({
      query: () => ({
        url: "/api/report/dailyServices",
      }),
    }),
    allStats: builder.query({
      query: () => ({
        url: "/api/report/allStats",
      }),
    }),
    monthlyService: builder.mutation({
      query: (data) => ({
        url: "/api/report/monthlyServices",
        method: "POST",
        body: data,
      }),
    }),
    sevenDayServiceDue: builder.query({
      query: (id) => ({
        url: "/api/report/serviceDue",
      }),
    }),
  }),
});

export const {
  useAddReportDataMutation,
  useGenerateReportMutation,
  useGetClientReportQuery,
  useDailyServicesQuery,
  useAllStatsQuery,
  useMonthlyServiceMutation,
  useSevenDayServiceDueQuery,
} = reportSlice;
