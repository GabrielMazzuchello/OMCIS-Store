import { BrowserRouter, Routes, Route } from "react-router-dom";

// 💡!! A CORREÇÃO ESTÁ AQUI !!
// Você precisa importar todas as páginas que está usando nas rotas.
// As linhas abaixo estavam faltando:
import Auth from "./pages/auth/Auth";
import Home from "./pages/user/Home";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Produtos from "./pages/admin/Produtos";
import Categoria from "./pages/admin/Categoria";
import Pedidos from "./pages/admin/Pedidos";
import NewAdmins from "./pages/admin/GerenciarAdministradores";

// regras
import { AuthProvider } from "./context/AuthContext";
import AdminRoute from "./routes/AdminRoute";

function App() {
  // const basename = import.meta.env.MODE === "production" ? "/OMCIS-Store" : "/";
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />

          {/* Área do Admin (protegida) */}
          <Route
            path="/admin"
            element={
              // Esta rota "pai" protege o layout geral do admin
              <AdminRoute allowedRoles={["master", "vendedor", "estoque"]}>
                <AdminLayout />
              </AdminRoute>
            }
          >
            {/* rotas filhas (cada uma com sua proteção específica) */}
            <Route
              index
              element={
                <AdminRoute allowedRoles={["master"]}>
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route
              path="produtos"
              element={
                <AdminRoute allowedRoles={["master", "vendedor"]}>
                  <Produtos />
                </AdminRoute>
              }
            />
            <Route
              path="categoria"
              element={
                <AdminRoute allowedRoles={["master", "vendedor"]}>
                  <Categoria />
                </AdminRoute>
              }
            />
            <Route
              path="pedidos"
              element={
                <AdminRoute allowedRoles={["master", "estoque"]}>
                  <Pedidos />
                </AdminRoute>
              }
            />
            <Route
              path="newAdmins"
              element={
                <AdminRoute allowedRoles={["master"]}>
                  <NewAdmins />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
