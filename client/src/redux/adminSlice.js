import { apiSlice } from "./apiSlice";

export const adminSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addAdminValue: builder.mutation({
      query: (data) => ({
        url: "/api/admin/value",
        method: "POST",
        body: data,
      }),
    }),
    getAdminValue: builder.query({
      query: () => ({
        url: "/api/admin/value",
      }),
    }),
    deleteAdminValue: builder.mutation({
      query: (data) => ({
        url: `/api/admin/value`,
        method: "DELETE",
        body: data,
      }),
    }),
  }),
});

export const {
  useAddAdminValueMutation,
  useGetAdminValueQuery,
  useDeleteAdminValueMutation,
} = adminSlice;
