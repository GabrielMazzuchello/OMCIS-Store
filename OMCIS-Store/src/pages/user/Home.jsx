import { useAuth } from "../../context/AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "admins"),
      (snapshot) => {
        const adminUIDs = snapshot.docs.map((doc) => doc.data().uid);
        setIsAdmin(adminUIDs.includes(currentUser.uid));
      },
      (error) => {
        console.error("Erro ao verificar admin:", error);
        setIsAdmin(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => navigate("/Auth")}>Login</button>
      {isAdmin && <button onClick={() => navigate("/HomeAdmin")}>Admin</button>}
    </div>
  );
}
