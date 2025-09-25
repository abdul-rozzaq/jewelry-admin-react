import { useTranslation } from "react-i18next";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage/LoginPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import AuthLayout from "./layouts/AuthLayout";
import TransactionsPage from "./pages/TransactionsPage/TransactionsPage";
import ProcessesPage from "./pages/ProcessesPage/ProcessesPage";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import MaterialsPage from "./pages/MaterialsPage/MaterialsPage";
import InventoriesPage from "./pages/InventoriesPage/InventoriesPage";
import OrganizationsPage from "./pages/OrganizationsPage/OrganizationsPage";
import UsersPage from "./pages/UsersPage/UsersPage";
import OrganizationDetailPage from "./pages/OrganizationsPage/OrganizationDetailPage";

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

              <Route path="/organizations">
                <Route index element={<OrganizationsPage />} />
                <Route path=":id" element={<OrganizationDetailPage />} />
              </Route>

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
