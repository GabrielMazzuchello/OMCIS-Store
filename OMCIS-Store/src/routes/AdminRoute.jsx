import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, "admins"));
        const adminUIDs = snapshot.docs.map((doc) => doc.data().uid);
        setIsAdmin(adminUIDs.includes(currentUser.uid));
      } catch (err) {
        console.error("Erro ao verificar admin:", err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [currentUser]);

  console.log(currentUser, isAdmin)
  if (loading || isAdmin === null) {
    return <p>Carregando...</p>;
  }

  if (!isAdmin) {
    return <Navigate to="/Auth" />;
  }

  return children;
}
