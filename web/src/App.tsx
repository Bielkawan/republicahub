import { Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./lib/api";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PropertiesPage } from "./pages/PropertiesPage";
import { RoomsPage } from "./pages/RoomsPage";
import { TenantsPage } from "./pages/TenantsPage";
import { PaymentsPage } from "./pages/PaymentsPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="propriedades" element={<PropertiesPage />} />
        <Route path="quartos" element={<RoomsPage />} />
        <Route path="moradores" element={<TenantsPage />} />
        <Route path="pagamentos" element={<PaymentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
