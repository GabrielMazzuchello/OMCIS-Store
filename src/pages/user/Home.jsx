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
import Modal from "../../components/Modal"

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
        alert("Desculpe, você atingiu a quantidade máxima em estoque.");
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
        alert("Desculpe, este produto está fora de estoque.");
        return;
      }
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const itemToUpdate = cart.find((item) => item.id === productId);
    if (newQuantity > itemToUpdate.quantidade) {
      alert("Quantidade máxima em estoque atingida.");
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
      alert("Você precisa estar logado para finalizar a compra.");
      navigate("/Auth");
      throw new Error("Usuário não logado");
    }

    if (cart.length === 0) {
      alert("Seu carrinho está vazio.");
      throw new Error("Carrinho vazio");
    }

    const produtosParaPedido = cart.map((item) => ({
      id: item.id,
      nome: item.nome,
      imagem: item.imagem,
      quantidade: item.quantity, // <--- Atenção aqui
      precoUnitario: item.preco,
    }));

    const valorTotal = cart.reduce(
      (acc, item) => acc + item.preco * item.quantity, // <--- E aqui
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
      setCart([]); // Limpa o carrinho
      
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

      <div className={styles.filtersContainer}></div>
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
    </div>
  );
}