import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";
import { DashboardStats } from "@/src/types/dashboard";

export const DashboardApi = createApi({
  reducerPath: "DashboardApi",
  baseQuery,
  tagTypes: ["dashboard"],
  endpoints: (builder) => ({
    getStats: builder.query<DashboardStats, void>({
      query: () => "/dashboard/stats/",
    }),
    // GetProcesses: builder.query({
    //   query: () => "/processes/list/",
    //   providesTags: ["Processes"],
    // }),
    // GetProcessById: builder.query({
    //   query: (id) => `/processes/${id}/`,
    // }),
    // CreateProcess: builder.mutation({
    //   query: (data) => ({
    //     url: "/processes/create/",
    //     method: "POST",
    //     body: data,
    //   }),
    //   invalidatesTags: ["Processes"],
    // }),
    // UpdateProcess: builder.mutation({
    //   query: ({id, ...data}) => ({
    //     url: '/process/'
    //   })
    // })
  }),
});

export const { useGetStatsQuery } = DashboardApi;
