import { useAuth } from "../../context/AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, loading, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Falha ao sair da conta:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "admins"),
      (snapshot) => {
        const adminUIDs = snapshot.docs.map((doc) => doc.data().uid || doc.id);
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
    return <p className={styles.loading}>Carregando...</p>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Oh my computer is sick!</h1>
      </header>

      <main className={styles.main}>
        <p className={styles.subtitle}>
          {currentUser
            ? `Bem-vindo, ${currentUser.email}`
            : "Bem-vindo ao sistema de merchandising!"}
        </p>

        <div className={styles.buttons}>
          {!currentUser ? (
            <button className={styles.btn} onClick={() => navigate("/Auth")}>
              Login
            </button>
          ) : (
            <>
              <button className={styles.btn} onClick={handleLogout}>
                Logout
              </button>
              {isAdmin && (
                <button
                  className={styles.btn}
                  onClick={() => navigate("/admin")}
                >
                  Área Admin
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
