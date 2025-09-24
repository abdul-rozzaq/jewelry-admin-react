import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

import { baseQuery } from "@/src/lib/service/api"



export const MaterialsApi = createApi({
  reducerPath: "MaterialsApi",
  baseQuery: baseQuery,
  tagTypes: ["Material"],
  endpoints: (builder) => ({
    getMaterials: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        if (params.search) {
          searchParams.append("search", params.search)
        }
        if (params.ordering) {
          searchParams.append("ordering", params.ordering)
        }
        const queryString = searchParams.toString()
        return `/materials/${queryString ? `?${queryString}` : ""}`
      },
    }),

    getMaterialById: builder.query({
      query: (id) => `/materials/${id}/`,
    }),

    addMaterial: builder.mutation({
      query: (data) => ({
        url: `/materials/`,
        method: "POST",
        body: data,
      }),
    }),

    updateMaterial: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/materials/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteMaterial: builder.mutation({
      query: (id) => ({
        url: `/materials/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useGetMaterialsQuery,
  useGetMaterialByIdQuery,
  useAddMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} = MaterialsApi
