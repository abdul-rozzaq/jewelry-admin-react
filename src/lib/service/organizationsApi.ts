import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "@/src/lib/service/api";

export const OrganizationsApi = createApi({
  reducerPath: "OrganizationsApi",
  baseQuery: baseQuery,
  tagTypes: ["Organization"],
  endpoints: (builder) => ({
    getOrganizations: builder.query({
      query: () => `/organizations/`,
      providesTags: ["Organization"],
    }),

    getOrganizationById: builder.query({
      query: (id) => `/organizations/${id}/`,
      providesTags: (result, error, id) => [{ type: "Organization", id }],
    }),

    getOrganizationTransactions: builder.query({
      query: ({ id, ...params }) => {
        const searchParams = new URLSearchParams();

        for (const key of Object.keys(params)) {
          if (params[key]) {
            searchParams.append(key, params[key]);
          }
        }

        const queryString = searchParams.toString();

        return `/organizations/${id}/transactions/${queryString ? `?${queryString}` : ``}`;
      },
      // providesTags: (result, error, id) => [{ type: "OrganizationTransactions", id }],
    }),

    addOrganization: builder.mutation({
      query: (data) => ({
        url: `/organizations/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),

    updateOrganization: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/organizations/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Organization", id }],
    }),

    deleteOrganization: builder.mutation({
      query: (id) => ({
        url: `/organizations/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Organization"],
    }),

    downloadOrganizationReport: builder.mutation({
      query: () => ({
        url: `/organizations/report/`,
        method: "POST",
        responseHandler: (response) => response.blob(),
      }),
    }),

    downloadProductsCountMatrix: builder.mutation({
      query: () => ({
        url: `/organizations/products-count-matrix/`,
        method: "POST",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetOrganizationByIdQuery,
  useAddOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useGetOrganizationTransactionsQuery,
  useDownloadOrganizationReportMutation,
  useDownloadProductsCountMatrixMutation,
} = OrganizationsApi;
