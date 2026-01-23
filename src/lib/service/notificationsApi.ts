import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/src/lib/service/api";

export const NotificationsApi = createApi({
  baseQuery,
  reducerPath: "notificationsApi",
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => "/notifications/",
      providesTags: ["Notifications"],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/mark-as-read/`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAsReadMutation } = NotificationsApi;
