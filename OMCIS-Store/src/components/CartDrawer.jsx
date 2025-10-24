import React, { useState } from "react";
import styles from "./CartDrawer.module.css";

const CartSummary = ({ cartItems, onNext, onUpdateQuantity, onRemoveItem }) => {
  if (cartItems.length === 0) {
    return (
      <div>
        <h3>Resumo do Pedido</h3>
        <p className={styles.emptyCartMessage}>Seu carrinho está vazio.</p>
      </div>
    );
  }
  const total = cartItems.reduce(
    (acc, item) => acc + item.preco * item.quantity,
    0
  );

  return (
    <div>
      <h3>Resumo do Pedido</h3>
      <ul className={styles.cartList}>
        {cartItems.map((item) => (
          <li key={item.id} className={styles.cartItem}>
            <img
              src={item.imagem}
              alt={item.nome}
              className={styles.itemImage}
            />
            <div className={styles.itemDetails}>
              <span className={styles.itemName}>{item.nome}</span>
              <div className={styles.quantitySelector}>
                <button
                  className={styles.quantityBtn}
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span className={styles.quantityDisplay}>{item.quantity}</span>
                <button
                  className={styles.quantityBtn}
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className={styles.itemPriceAndRemove}>
              <span className={styles.itemPrice}>
                {(item.preco * item.quantity).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
              <button
                className={styles.removeItemBtn}
                onClick={() => onRemoveItem(item.id)}
              >
                &times;
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* A lista, o total e o botão só aparecem se o carrinho tiver itens */}
      <div className={styles.cartTotal}>
        <span>Total</span>
        <span>
          {total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      </div>

      <button onClick={onNext} className={styles.checkoutBtn}>
        Prosseguir para Entrega
      </button>
    </div>
  );
};

// --- Componente 2: Formulário de Endereço ---
const AddressForm = ({ onNext, onBack, formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isFormValid =
    formData.telefone.trim() !== "" &&
    formData.cep.trim() !== "" &&
    formData.cidade.trim() !== "" &&
    formData.endereco.trim() !== "" &&
    formData.numero.trim() !== "";

  return (
    <div>
      <h3>Endereço de Entrega</h3>
      <input
        type="tel"
        placeholder="Telefone"
        className={styles.inputField}
        name="telefone"
        value={formData.telefone}
        onChange={handleChange}
      />
      <input
        type="text"
        placeholder="CEP"
        className={styles.inputField}
        name="cep"
        value={formData.cep}
        onChange={handleChange}
      />
      <input
        type="text"
        placeholder="Cidade"
        className={styles.inputField}
        name="cidade"
        value={formData.cidade}
        onChange={handleChange}
      />
      <input
        type="text"
        placeholder="Endereço"
        className={styles.inputField}
        name="endereco"
        value={formData.endereco}
        onChange={handleChange}
      />
      <input
        type="text"
        placeholder="Número"
        className={styles.inputField}
        name="numero"
        value={formData.numero}
        onChange={handleChange}
      />
      <input
        type="text"
        placeholder="Complemento (Opcional)"
        className={styles.inputField}
        name="complemento"
        value={formData.complemento}
        onChange={handleChange}
      />

      <div className={styles.navigationButtons}>
        <button onClick={onBack} className={styles.backBtn}>
          Voltar
        </button>
        <button
          onClick={onNext}
          className={styles.checkoutBtn}
          disabled={!isFormValid}
        >
          Ir para Pagamento
        </button>
      </div>
    </div>
  );
};

// Formulário de Pagamento ---
const PaymentForm = ({ onBack, onFinish }) => (
  <div>
    <h3>Pagamento</h3>
    <p>Aqui entrariam os campos de cartão de crédito (apenas para exibição).</p>
    <div className={styles.navigationButtons}>
      <button onClick={onBack} className={styles.backBtn}>
        Voltar
      </button>
      <button onClick={onFinish} className={styles.checkoutBtn}>
        Finalizar Compra
      </button>
    </div>
  </div>
);

const Confirmation = ({ onClose }) => (
  <div>
    <h3>Pedido Realizado com Sucesso!</h3>
    <p>Obrigado por sua compra.</p>
    <button onClick={onClose} className={styles.checkoutBtn}>
      Fechar
    </button>
  </div>
);

function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onFinalizePurchase,
}) {
  const [checkoutStep, setCheckoutStep] = useState("summary");
  const [addressData, setAddressData] = useState({
    telefone: "",
    cep: "",
    cidade: "",
    endereco: "",
    numero: "",
    complemento: "",
  });

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setCheckoutStep("summary");
    onClose();
  };

  const renderStepContent = () => {
    switch (checkoutStep) {
      case "summary":
        return (
          <CartSummary
            cartItems={cartItems}
            onNext={() => setCheckoutStep("address")}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
          />
        );
      case "address":
        return (
          <AddressForm
            onNext={() => setCheckoutStep("payment")}
            onBack={() => setCheckoutStep("summary")}
            formData={addressData}
            setFormData={setAddressData}
          />
        );
      case "payment":
        // <-- MUDANÇA 7: Criar um 'handler' para o botão de finalizar
        const handleFinishPurchase = async () => {
          try {
            // Chama a função que veio do Home.js
            await onFinalizePurchase(addressData);
            // Se der certo, avança para a confirmação
            setCheckoutStep("confirmation");
          } catch (error) {
            // Se der erro, mostra o alerta
            alert(error.message);
          }
        };

        return (
          <PaymentForm
            onBack={() => setCheckoutStep("address")}
            onFinish={handleFinishPurchase} // Passa o novo handler
          />
        );
      case "confirmation":
        return <Confirmation onClose={handleClose} />;
      default:
        return (
          <CartSummary
            cartItems={cartItems}
            onNext={() => setCheckoutStep("address")}
            onUpdateQuantity={onUpdateQuantity}
            // <-- MUDANÇA 8: Adicionar as props que faltavam no 'default'
            onRemoveItem={onRemoveItem}
          />
        );
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.cartDrawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cartHeader}>
          <h2>Seu Carrinho</h2>
          <button onClick={handleClose} className={styles.closeBtn}>
            &times;
          </button>
        </div>
        <div className={styles.cartBody}>{renderStepContent()}</div>
      </div>
    </div>
  );
}

export default CartDrawer;
