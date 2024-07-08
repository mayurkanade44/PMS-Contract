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
    updateRequest: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/schedule/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Schedules"],
    }),
    getAllTechnicians: builder.query({
      query: () => ({
        url: "/api/schedule/allTechnicians",
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 10,
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

export const {
  useAddRequestByClientMutation,
  useGetAllSchedulesQuery,
  useUpdateRequestMutation,
  useGetAllTechniciansQuery
} = serviceRequestSlice;
