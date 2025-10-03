import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/src/lib/service/api";

export const ProductsApi = createApi({
  reducerPath: "ProductsApi",
  baseQuery: baseQuery,
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.search) searchParams.append("search", params.search);
        if (params.ordering) searchParams.append("ordering", params.ordering);
        if (params.organization) searchParams.append("organization", params.organization);

        return `/products/?${searchParams.toString()}`;
      },
      providesTags: ["Products"],
    }),

    getProductById: builder.query({
      query: (id) => `/products/${id}/`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),

    addProduct: builder.mutation({
      query: (data) => ({
        url: `/products/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/products/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Products", id }],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const { useGetProductsQuery, useGetProductByIdQuery, useAddProductMutation, useUpdateProductMutation, useDeleteProductMutation } = ProductsApi;
