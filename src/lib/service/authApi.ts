import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "@/src/lib/service/api";

const AuthApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ username, password }) => ({
        url: "auth/login/",
        method: "POST",
        body: { username, password },
      }),
    }),

    tokenVerify: builder.mutation({
      query: ({ token }) => ({
        url: "auth/verify/",
        method: "POST",
        body: { token },
      }),
    }),

    refreshToken: builder.mutation({
      query: (refresh) => ({
        url: "auth/refresh/",
        method: "POST",
        body: { refresh },
      }),
    }),
  }),
});

export const { useTokenVerifyMutation, useRefreshTokenMutation, useLoginMutation } = AuthApi;

export default AuthApi;
