import { apiSlice } from "./apiSlice";

export const serviceRequestSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addRequestByClient: builder.mutation({
      query: (data) => ({
        url: "/api/schedule/byClient",
        method: "POST",
        body: data,
      }),
    }),
    getAllSchedules: builder.query({
      query: ({
        scheduleType,
        jobStatus,
        serviceType,
        date,
        search,
        page,
      }) => ({
        url: `/api/schedule`,
        params: {
          scheduleType,
          jobStatus,
          serviceType,
          date,
          search,
          page,
        },
      }),
      providesTags: ["Schedules"],
      keepUnusedDataFor: 10,
    }),
  }),
});

export const { useAddRequestByClientMutation, useGetAllSchedulesQuery } =
  serviceRequestSlice;
