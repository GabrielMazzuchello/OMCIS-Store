import { useAuth } from "../../context/AuthContext";
import {
  addDoc,
  collection,
  writeBatch,
  doc,
  increment,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import styles from "./Home.module.css";
import CartDrawer from "../../components/CartDrawer";
import Modal from "../../components/Modal"; // Importação já estava aqui

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, loading, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(1);
  const [maxPrice, setMaxPrice] = useState(1000);

  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
    onCloseCallback: null, // Para lidar com o redirecionamento
  });
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "produtos"), (snapshot) => {
      const activeProducts = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((product) => product.status !== false && product.quantidade > 0);
      setProducts(activeProducts);
    });
    return () => unsub();
  }, []);

  const filteredProducts = useMemo(() => {
    let currentProducts = products;
    if (searchTerm) {
      currentProducts = currentProducts.filter((product) =>
        product.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "all") {
      currentProducts = currentProducts.filter(
        (product) => product.categoria === selectedCategory
      );
    }
    currentProducts = currentProducts.filter(
      (product) => product.preco >= minPrice && product.preco <= maxPrice
    );
    return currentProducts;
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

  const categories = useMemo(() => {
    const allCategories = products
      .map((product) => product.categoria)
      .filter(Boolean);
    return ["all", ...new Set(allCategories)];
  }, [products]);

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
    return () => unsubscribe();
  }, [currentUser]);


  if (loading || isAdmin === null) {
    return <p className={styles.loading}>Carregando...</p>;
  }

  const handleAddToCart = (productToAdd) => {
    const existingItem = cart.find((item) => item.id === productToAdd.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > productToAdd.quantidade) {
        setModalInfo({
          isOpen: true,
          title: "Estoque Insuficiente",
          message: "Desculpe, você atingiu a quantidade máxima em estoque para este item."
        });
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === productToAdd.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } else {
      if (1 > productToAdd.quantidade) {
        setModalInfo({
          isOpen: true,
          title: "Fora de Estoque",
          message: "Desculpe, este produto está fora de estoque no momento."
        });
        return;
      }
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const itemToUpdate = cart.find((item) => item.id === productId);
    if (newQuantity > itemToUpdate.quantidade) {
      setModalInfo({
        isOpen: true,
        title: "Estoque Insuficiente",
        message: "Você já atingiu a quantidade máxima em estoque para este item."
      });
      return;
    }
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const handleFinalizePurchase = async (addressData) => {
    if (!currentUser) {
      setModalInfo({
        isOpen: true,
        title: "Acesso Negado",
        message: "Você precisa estar logado para finalizar a compra. Você será redirecionado para a tela de login.",
        onCloseCallback: () => navigate("/Auth") // Callback para navegar ao fechar
      });
      throw new Error("Usuário não logado");
    }

    if (cart.length === 0) {
      setModalInfo({
        isOpen: true,
        title: "Carrinho Vazio",
        message: "Seu carrinho está vazio. Adicione produtos antes de finalizar a compra."
      });
      throw new Error("Carrinho vazio");
    }

    // ... (resto da lógica de finalização) ...
    const produtosParaPedido = cart.map((item) => ({
      id: item.id,
      nome: item.nome,
      imagem: item.imagem,
      quantidade: item.quantity, 
      precoUnitario: item.preco,
    }));
    const valorTotal = cart.reduce(
      (acc, item) => acc + item.preco * item.quantity,
      0
    );
    const newOrder = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      produtos: produtosParaPedido,
      valorTotal: valorTotal,
      endereco: {
        telefone: addressData.telefone,
        cep: addressData.cep,
        cidade: addressData.cidade,
        logradouro: addressData.endereco,
        numero: addressData.numero,
        complemento: addressData.complemento,
      },
      status: "pago",
      createdAt: serverTimestamp(),
    };
    try {
      const batch = writeBatch(db);
      const orderRef = doc(collection(db, "pedidos"));
      batch.set(orderRef, newOrder);
      for (const item of cart) {
        const productRef = doc(db, "produtos", item.id);
        batch.update(productRef, {
          quantidade: increment(-item.quantity),
        });
      }
      await batch.commit();
      setCart([]);
    } catch (error) {
      console.error("Erro ao finalizar a compra:", error);
      throw new Error("Falha ao processar o pedido. Tente novamente.");
    }
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const closeModal = () => {
    if (modalInfo.onCloseCallback) {
      modalInfo.onCloseCallback();
    }
    setModalInfo({ isOpen: false, title: "", message: "", onCloseCallback: null });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Oh my computer is sick!</h1>
        <div className={styles.navButtonsContainer}>
          <div className={styles.navButtonsLeft}>
            <button
              className={`${styles.btn} ${styles.btnCarrinho}`}
              style={{ padding: "7px 15px 7px 15px" }}
              onClick={() => openCart()}
            >
              <span className={styles.iconeCarrinho}></span> {cart.length}
            </button>
          </div>
          <div className={styles.navButtonsRight}>
            {!currentUser ? (
              <button className={styles.btn} onClick={() => navigate("/Auth")}>
                Login
              </button>
            ) : (
              <>
                <button className={styles.btn} onClick={handleLogout}>
                  Logout
                </button>
                <> </>
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
        </div>
      </header>
      {/* filtros */}
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
            {/* O .slice(1) pula o "all" que já está no array */}
            {categories.slice(1).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
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
                className={styles.rangeInput}
                onChange={(e) => {
                  const newMin = Number(e.target.value);
                  // Garante que o mínimo não seja maior que o máximo
                  setMinPrice(Math.min(newMin, maxPrice));
                }}
              />
              <input
                type="range"
                min="1"
                max="1000"
                value={maxPrice}
                className={styles.rangeInput}
                onChange={(e) => {
                  const newMax = Number(e.target.value);
                  // Garante que o máximo não seja menor que o mínimo
                  setMaxPrice(Math.max(newMax, minPrice));
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.filtersContainer}>{/* Seus filtros aqui */}</div>
      
      <main className={styles.productsGrid}>
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
              <button
                className={styles.addToCartBtn}
                onClick={() => handleAddToCart(prod)}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <p className={styles.noResults}>Nenhum produto encontrado.</p>
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onFinalizePurchase={handleFinalizePurchase}
      />

      {modalInfo.isOpen && (
        <Modal titulo={modalInfo.title} onClose={closeModal}>
          <p>{modalInfo.message}</p>
        </Modal>
      )}
    </div>
  );
}