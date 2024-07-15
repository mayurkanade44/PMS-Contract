import { apiSlice } from "./apiSlice";

export const serviceRequestSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addRequestByClient: builder.mutation({
      query: (data) => ({
        url: "/api/schedule/byClient",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Schedules"],
    }),
    addRequestByPms: builder.mutation({
      query: (data) => ({
        url: "/api/schedule/byPms",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Schedules"],
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
      query: ({ date, time }) => ({
        url: "/api/schedule/allTechnicians",
        params: { date, time },
      }),
    }),
    getClientDetails: builder.query({
      query: ({ search }) => ({
        url: "/api/schedule/byPms",
        params: { search },
      }),
    }),
    getTechnicianSchedules: builder.query({
      query: ({ date }) => ({
        url: "/api/schedule/technicianSchedules",
        params: { date },
      }),
      providesTags: ["Schedules"],
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
  useGetAllTechniciansQuery,
  useGetClientDetailsQuery,
  useAddRequestByPmsMutation,
  useGetTechnicianSchedulesQuery,
} = serviceRequestSlice;
