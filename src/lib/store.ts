import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authlice";
import AuthApi from "./service/authApi";
import { AtolyeApi } from "./service/atolyeApi";
import { UsersApi } from "./service/usersApi";
import { MaterialsApi } from "./service/materialsApi";
import { InventoryApi } from "./service/inventoryApi";
import { TransactionsApi } from "./service/transactionsApi";
import { ProcessesApi } from "./service/processApi";
import { DashboardApi } from "./service/dashboard";

const store = configureStore({
  reducer: {
    auth: authSlice,
    [AuthApi.reducerPath]: AuthApi.reducer,
    [AtolyeApi.reducerPath]: AtolyeApi.reducer,
    [UsersApi.reducerPath]: UsersApi.reducer,
    [MaterialsApi.reducerPath]: MaterialsApi.reducer,
    [InventoryApi.reducerPath]: InventoryApi.reducer,
    [TransactionsApi.reducerPath]: TransactionsApi.reducer,
    [ProcessesApi.reducerPath]: ProcessesApi.reducer,
    [DashboardApi.reducerPath]: DashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      AuthApi.middleware,
      AtolyeApi.middleware,
      UsersApi.middleware,
      MaterialsApi.middleware,
      InventoryApi.middleware,
      TransactionsApi.middleware,
      ProcessesApi.middleware,
      DashboardApi.middleware
    ),
});

export default store;
