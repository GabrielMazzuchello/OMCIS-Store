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
  const [products, setProducts] = useState([]); 

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "produtos"), (snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

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

    return () => unsubscribe(); // Limpa o listener
  }, [currentUser]);

  if (loading || isAdmin === null) {
    return <p className={styles.loading}>Carregando...</p>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Oh my computer is sick!</h1>
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
      </header>
      <main className={styles.productsGrid}>
        {products.map((prod) => (
          // Início do Card do Produto
          <div key={prod.id} className={styles.productCard}>
            <img
              src={prod.imagem}
              alt={prod.nome}
              className={styles.productImage}
            />
            <div className={styles.cardBody}>
              <h2 className={styles.productName}>{prod.nome}</h2>
              <p>Tamanhos: {prod.tamanhos.join(", ")}</p>
              <p className={styles.productPrice}>
                {prod.preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              <button className={styles.addToCartBtn}>
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
          // Fim do Card do Produto
        ))}
      </main>
    </div>
  );
}
