import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/auth/Auth";
import Home from "./pages/user/Home";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Auth" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

//           {/* Área do cliente */}
//           <Route path="/" element={<Home />} />
//           <Route path="/produto/:id" element={<Produto />} />
//           <Route path="/categoria/:id" element={<Categoria />} />
//           <Route path="/carrinho" element={<Carrinho />} />

//           {/* Autenticação */}
//           <Route path="/login" element={<Auth />} />

//           {/* Área administrativa */}
//           <Route path="/admin" element={<AdminLayout />}>
//             <Route path="produtos" element={<ListaProdutos />} />
//             <Route path="categorias" element={<ListaCategorias />} />
//             <Route path="pedidos" element={<ListaPedidos />} />
//           </Route>
