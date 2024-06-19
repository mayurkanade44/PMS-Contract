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
  }),
});

export const { useAddRequestByClientMutation } = serviceRequestSlice;
