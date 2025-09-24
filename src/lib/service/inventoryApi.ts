import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { baseQuery } from "@/src/lib/service/api"


export const InventoryApi = createApi({
  reducerPath: "InventoryApi",
  baseQuery: baseQuery,
  tagTypes: ["Inventory"],
  endpoints: (builder) => ({
    getInventory: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()

        if (params.search) searchParams.append("search", params.search)
        if (params.ordering) searchParams.append("ordering", params.ordering)
        if (params.organization) searchParams.append("organization", params.organization)

        return `/inventory/?${searchParams.toString()}`
      },
      providesTags: ["Inventory"],
    }),

    getInventoryById: builder.query({
      query: (id) => `/inventory/${id}/`,
      providesTags: (result, error, id) => [{ type: "Inventory", id }],
    }),

    addInventory: builder.mutation({
      query: (data) => ({
        url: `/inventory/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Inventory"],
    }),

    updateInventory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/inventory/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Inventory", id }],
    }),

    deleteInventory: builder.mutation({
      query: (id) => ({
        url: `/inventory/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Inventory"],
    }),
  }),
})

export const {
  useGetInventoryQuery,
  useGetInventoryByIdQuery,
  useAddInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
} = InventoryApi
