import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";

export const ProjectsApi = createApi({
  reducerPath: "ProjectsApi",
  baseQuery: baseQuery,
  tagTypes: ["Projects"],
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => "/projects/",
      providesTags: ["Projects"],
    }),
    getProjectById: builder.query({
      query: (id) => `/projects/${id}/`,
      providesTags: (result, error, id) => [{ type: "Projects", id }],
    }),
    addProject: builder.mutation({
      query: (body) => ({ url: "/projects/", method: "POST", body }),
      invalidatesTags: ["Projects"],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/projects/${id}/`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Projects", id }],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),
  }),
});


export const { useGetProjectsQuery, useGetProjectByIdQuery, useAddProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation } = ProjectsApi