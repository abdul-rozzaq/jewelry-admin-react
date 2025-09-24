import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";

export const ProcessesApi = createApi({
  reducerPath: "ProcessesApi",
  baseQuery,
  tagTypes: ["Processes", "Inventory"],
  endpoints: (builder) => ({
    GetProcesses: builder.query({
      query: () => "/processes/list/",
      providesTags: ["Processes"],
    }),
    CreateProcess: builder.mutation({
      query: (data) => ({
        url: "/processes/create/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Processes", "Inventory"],
    }),
    CompleteProcess: builder.mutation({
      query: (id: number) => ({
        url: `/processes/${id}/complete/`,
        method: "POST",
      }),
      invalidatesTags: ["Processes"],
    }),
    DeleteProcess: builder.mutation({
      query: (id: number) => ({
        url: `/processes/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Processes"],
    }),
  }),
});

export const {
  useGetProcessesQuery,
  useCreateProcessMutation,
  useCompleteProcessMutation,
  useDeleteProcessMutation,
} = ProcessesApi;
