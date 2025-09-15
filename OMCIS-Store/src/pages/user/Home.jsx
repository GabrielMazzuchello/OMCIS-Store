import { useAuth } from "../../context/AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "admins"),
      (snapshot) => {
        const adminUIDs = snapshot.docs.map((doc) => doc.data().uid || doc.id);

        console.log("Admins encontrados:", adminUIDs);
        console.log("UID atual:", currentUser.uid);

        setIsAdmin(adminUIDs.includes(currentUser.uid));
      },
      (error) => {
        console.error("Erro ao verificar admin:", error);
        setIsAdmin(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  if (loading || isAdmin === null) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => navigate("/Auth")}>Login</button>
      {isAdmin && <button onClick={() => navigate("/admin")}>Admin</button>}
    </div>
  );
}
