import { BrowserRouter, Routes, Route } from "react-router-dom";
// páginas públicas
import Auth from "./pages/auth/Auth";
import Home from "./pages/user/Home";
// páginas admin
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
  return (
    <BrowserRouter basename="/OMCIS-Store">
      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />

          {/* Área do Admin (protegida) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            {/* rotas filhas */}
            <Route index element={<Dashboard />} /> {/* /admin */}
            <Route path="produtos" element={<Produtos />} />{" "}
            {/* /admin/produtos */}
            <Route path="categoria" element={<Categoria />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="newAdmins" element={<NewAdmins />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
