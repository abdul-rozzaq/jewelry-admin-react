import { useTranslation } from "react-i18next";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AuthLayout from "./layouts/AuthLayout";
import TransactionsPage from "./pages/TransactionsPage";
import ProcessesPage from "./pages/ProcessesPage";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFoundPage from "./pages/NotFoundPage";
import MaterialsPage from "./pages/MaterialsPage";
import InventoriesPage from "./pages/InventoriesPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import UsersPage from "./pages/UsersPage";

function App() {
  const { t, i18n } = useTranslation();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AuthLayout />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/inventories" element={<InventoriesPage />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/processes" element={<ProcessesPage />} />
              <Route path="/*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
