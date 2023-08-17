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
    allUsers: builder.query({
      query: () => ({
        url: "/api/admin/user",
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 10,
    }),
    deleteUser: builder.mutation({
      query: (data) => ({
        url: `/api/admin/user`,
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
  useAllUsersQuery,
  useDeleteUserMutation,
} = adminSlice;
