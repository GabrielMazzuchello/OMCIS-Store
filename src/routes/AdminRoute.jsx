import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Renomeei para aceitar 'allowedRoles' (funções permitidas)
export default function AdminRoute({ children, allowedRoles }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState(null); // null = carregando
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      // Se não há usuário logado, marca como "não autenticado"
      if (!currentUser) {
        setUserRole("unauthenticated");
        setRoleLoading(false);
        return;
      }

      try {
        // !! ESTA É A LÓGICA CORRETA E EFICIENTE (do seu NavbarAdmin) !!
        // Ela busca APENAS o admin logado, em vez de baixar todos.
        const adminsCollectionRef = collection(db, "admins");
        const q = query(
          adminsCollectionRef,
          where("uid", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Logado, mas não está na coleção 'admins'
          setUserRole("not_admin");
        } else {
          // Encontrou o admin, armazena a role
          const role = querySnapshot.docs[0].data().role;
          setUserRole(role);
        }
      } catch (err) {
        console.error("Erro ao verificar admin:", err);
        setUserRole("not_admin"); // Trata erro como "não admin"
      } finally {
        setRoleLoading(false);
      }
    };

    // Só busca a role se a autenticação do Firebase já terminou
    if (!authLoading) {
      fetchUserRole();
    }
  }, [currentUser, authLoading]);

  // Enquanto o auth ou a role estiverem carregando
  if (authLoading || roleLoading) {
    return <p>Carregando...</p>; // Ou seu componente de loading
  }

  // Se não está logado, vai para a página de autenticação
  if (userRole === "unauthenticated") {
    return <Navigate to="/auth" replace />;
  }

  // Se está logado, mas não é um admin (uid não encontrado na coleção)
  if (userRole === "not_admin") {
    // Redireciona para a home, pois ele não deveria estar na área /admin
    return <Navigate to="/" replace />;
  }

  // !! A VERIFICAÇÃO PRINCIPAL !!
  // Se a role do usuário NÃO ESTÁ na lista de roles permitidas
  if (!allowedRoles.includes(userRole)) {
    // Redireciona o usuário para uma página que ele PODE ver.
    // Isso conserta o seu problema do vendedor no Dashboard.
    if (userRole === "vendedor") {
      return <Navigate to="/admin/produtos" replace />;
    }
    if (userRole === "estoque") {
      return <Navigate to="/admin/pedidos" replace />;
    }
    // Se for master ou outro caso, manda para a home
    return <Navigate to="/" replace />;
  }

  // Se passou em tudo, o usuário tem permissão: renderiza a página
  return children;
}
