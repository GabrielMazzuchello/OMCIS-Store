import { useAuth } from "../../context/AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import styles from "./Home.module.css"; // Assumindo que você tem classes CSS para estilização

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, loading, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [products, setProducts] = useState([]);

  // --- Estados para os Filtros ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(1);
  const [maxPrice, setMaxPrice] = useState(1000);
  // ---------------------------------

  // 1. Efeito para carregar produtos do Firebase
  useEffect(() => {
    // Apenas produtos que NÃO ESTEJAM com status: false devem ser carregados inicialmente
    // Embora o ideal seria filtrar no lado do Firebase (query), para simplificar, filtramos após o fetch
    // Se 'status' não for fornecido, assumimos que está 'true'
    const unsub = onSnapshot(collection(db, "produtos"), (snapshot) => {
      // Filtramos aqui para garantir que produtos com status: false não entrem no estado 'products'
      const activeProducts = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((product) => product.status !== false);

      setProducts(activeProducts);
    });

    return () => unsub();
  }, []);

  // 2. Lógica de Filtragem (Onde a mágica acontece!)
  const filteredProducts = useMemo(() => {
    // Começa com a lista de produtos ativos (já filtrados por status no useEffect)
    let currentProducts = products;

    // A. Filtro por Termo de Busca (Input)
    if (searchTerm) {
      currentProducts = currentProducts.filter((product) =>
        product.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // B. Filtro por Categoria (Select)
    if (selectedCategory !== "all") {
      currentProducts = currentProducts.filter(
        (product) => product.categoria === selectedCategory
      );
    }

    // C. Filtro por Faixa de Preço (Range Sliders)
    // Converte para número e verifica se o preço está dentro da faixa
    currentProducts = currentProducts.filter(
      (product) => product.preco >= minPrice && product.preco <= maxPrice
    );

    return currentProducts;
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

  // 3. Extrai todas as categorias únicas para o Select
  const categories = useMemo(() => {
    const allCategories = products
      .map((product) => product.categoria)
      .filter(Boolean);
    return ["all", ...new Set(allCategories)]; // 'all' para todas, e depois as únicas
  }, [products]);

  // Funções de Autenticação e Admin (Mantidas)
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

      {/* --- Seção de Filtros --- */}
      <div className={styles.filtersContainer}>
        {/* Input de Busca */}
        <input
          type="text"
          placeholder="Pesquisar produto..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className={styles.filterSelectContainer}>
          {/* Select de Categoria */}
          <select
            className={styles.selectFilter}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas as Categorias</option>
            {categories.slice(1).map(
              (
                category // Pula o 'all' inicial
              ) => (
                <option key={category} value={category}>
                  {category}
                </option>
              )
            )}
          </select>

          {/* Filtro de Faixa de Preço (Range Sliders) */}
          <div className={styles.priceRangeContainer}>
            <label>
              Preço: R$ {minPrice.toFixed(2)} até R$ {maxPrice.toFixed(2)}
            </label>
            <div className={styles.rangeSliders}>
              <input
                type="range"
                min="1"
                max="1000"
                value={minPrice}
                onChange={(e) => {
                  const newMin = Number(e.target.value);
                  // Garante que o mínimo não seja maior que o máximo
                  setMinPrice(Math.min(newMin, maxPrice));
                }}
                className={styles.rangeInput}
              />
              <input
                type="range"
                min="1"
                max="1000"
                value={maxPrice}
                onChange={(e) => {
                  const newMax = Number(e.target.value);
                  // Garante que o máximo não seja menor que o mínimo
                  setMaxPrice(Math.max(newMax, minPrice));
                }}
                className={styles.rangeInput}
              />
            </div>
          </div>
        </div>
      </div>
      {/* ------------------------- */}

      <p className={styles.resultCount}>
        {filteredProducts.length} Produto(s) encontrado(s)
      </p>

      <main className={styles.productsGrid}>
        {/* Itera sobre os PRODUTOS FILTRADOS */}
        {filteredProducts.map((prod) => (
          <div key={prod.id} className={styles.productCard}>
            <img
              src={prod.imagem}
              alt={prod.nome}
              className={styles.productImage}
            />
            <div className={styles.cardBody}>
              <h2 className={styles.productName}>{prod.nome}</h2>
              {prod.tamanhos && <p>Tamanhos: {prod.tamanhos.join(", ")}</p>}
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
        ))}

        {filteredProducts.length === 0 && (
          <p className={styles.noResults}>Nenhum produto encontrado.</p>
        )}
      </main>
    </div>
  );
}
