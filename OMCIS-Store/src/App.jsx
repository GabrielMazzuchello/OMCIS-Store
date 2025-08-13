// importações nescessarias
import { BrowserRouter, Routes, Route } from "react-router-dom";
// paginas
import Auth from "./pages/auth/Auth";
import Home from "./pages/user/Home";
import HomeAdmin from "./pages/admin/HomeAdmin";
import Produtos from "./pages/admin/Produtos";
// regras para as rotas
import { AuthProvider } from "./context/AuthContext";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/" element={<Home />} />
          <Route path="/Auth" element={<Auth />} />

          {/* Protegida só para admins */}
          <Route
            path="/HomeAdmin"
            element={
              <AdminRoute>
                <HomeAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/Produtos"
            element={
              <AdminRoute>
                <Produtos />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
