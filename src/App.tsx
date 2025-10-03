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
import InventoriesPage from "./pages/ProductsPage/ProductsPage";
import OrganizationsPage from "./pages/OrganizationsPage/OrganizationsPage";
import UsersPage from "./pages/UsersPage/UsersPage";
import OrganizationDetailPage from "./pages/OrganizationsPage/OrganizationDetailPage";
import CreateTransactionPage from "./pages/TransactionsPage/CreateTransactionPage";
import CreateProcessPage from "./pages/ProcessesPage/CreateProcessPage";
import { ThemeProvider } from "./context/ThemeContext";
import TransactionDetailPage from "./pages/TransactionsPage/TransactionDetailPage";

function App() {
  const { t, i18n } = useTranslation();

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AuthLayout />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />

              <Route path="/materials" element={<MaterialsPage />} />

              <Route path="/products" element={<InventoriesPage />} />

              <Route path="/organizations">
                <Route index element={<OrganizationsPage />} />
                <Route path=":id" element={<OrganizationDetailPage />} />
              </Route>

              <Route path="/transactions">
                <Route index element={<TransactionsPage />} />
                <Route path="create" element={<CreateTransactionPage />} />
                <Route path=":id" element={<TransactionDetailPage />} />
              </Route>

              <Route path="/users" element={<UsersPage />} />

              <Route path="/processes">
                <Route index element={<ProcessesPage />} />
                <Route path="create" element={<CreateProcessPage />} />
              </Route>

              <Route path="/*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
