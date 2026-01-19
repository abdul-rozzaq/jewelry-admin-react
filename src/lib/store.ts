import { configureStore } from "@reduxjs/toolkit";
import AuthApi from "./service/authApi";
import { OrganizationsApi } from "./service/organizationsApi";
import { UsersApi } from "./service/usersApi";
import { MaterialsApi } from "./service/materialsApi";
import { ProductsApi } from "./service/productsApi";
import { TransactionsApi } from "./service/transactionsApi";
import { ProcessesApi } from "./service/processesApi";
import { DashboardApi } from "./service/dashboardApi";
import { ProjectsApi } from "./service/projectsApi";
import { NotificationsApi } from "./service/notificationsApi";

const store = configureStore({
  reducer: {
    [AuthApi.reducerPath]: AuthApi.reducer,
    [OrganizationsApi.reducerPath]: OrganizationsApi.reducer,
    [UsersApi.reducerPath]: UsersApi.reducer,
    [MaterialsApi.reducerPath]: MaterialsApi.reducer,
    [ProductsApi.reducerPath]: ProductsApi.reducer,
    [TransactionsApi.reducerPath]: TransactionsApi.reducer,
    [ProcessesApi.reducerPath]: ProcessesApi.reducer,
    [DashboardApi.reducerPath]: DashboardApi.reducer,
    [ProjectsApi.reducerPath]: ProjectsApi.reducer,
    [NotificationsApi.reducerPath]: NotificationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      AuthApi.middleware,
      OrganizationsApi.middleware,
      UsersApi.middleware,
      MaterialsApi.middleware,
      ProductsApi.middleware,
      TransactionsApi.middleware,
      ProcessesApi.middleware,
      DashboardApi.middleware,
      ProjectsApi.middleware,
      NotificationsApi.middleware,
    ),
});

export default store;
