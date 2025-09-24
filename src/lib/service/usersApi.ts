import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/src/lib/service/api";

export const UsersApi = createApi({
  reducerPath: "UsersApi",
  baseQuery: baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => `/auth/users/`,
    }),

    getUserById: builder.query({
      query: (id) => `/auth/users/${id}/`,
    }),

    addUsers: builder.mutation({
      query: (data) => ({
        url: `/auth/users/`,
        method: "POST",
        body: data,
      }),
    }),

    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/auth/users/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/auth/users/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useAddUsersMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = UsersApi;
