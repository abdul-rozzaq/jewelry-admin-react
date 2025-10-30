import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";

export const ProcessesApi = createApi({
  reducerPath: "ProcessesApi",
  baseQuery,
  tagTypes: ["Processes", "Products", "ProcessTypes"],
  endpoints: (builder) => ({
    GetProcesses: builder.query({
      query: () => "/processes/list/",
      providesTags: ["Processes"],
    }),
    GetProcessById: builder.query({
      query: (id: number | string) => `/processes/retrieve/${id}/`,
      providesTags: (result, error, id) => [{ type: "Processes", id } as any],
    }),
    CreateProcess: builder.mutation({
      query: (data) => ({
        url: "/processes/create/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Processes", "Products"],
    }),
    UpdateProcess: builder.mutation({
      query: ({ id, ...data }: any) => ({
        url: `/processes/${id}/update/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Processes", id } as any],
    }),
    GetProcessTypes: builder.query({
      query: () => "/processes/types/",
      providesTags: ["ProcessTypes"],
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
  useGetProcessByIdQuery,
  useCreateProcessMutation,
  useUpdateProcessMutation,
  useCompleteProcessMutation,
  useDeleteProcessMutation,
  useGetProcessTypesQuery,
} = ProcessesApi;
