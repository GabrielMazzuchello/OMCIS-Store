import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import styles from "./Pedidos.module.css";
import Modal from "../../components/Modal";

//Filtros
const OrderFilters = ({ filterStatus, onFilterChange }) => {
  return (
    <div className={styles.filterContainer}>
      {Object.keys(filterStatus).map((status) => (
        <label key={status} className={styles.toggleSwitch}>
          <input
            type="checkbox"
            checked={filterStatus[status]}
            onChange={(e) => onFilterChange(status, e.target.checked)}
          />
          <span className={styles.slider}></span>
          <span className={styles.toggleLabel}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </label>
      ))}
    </div>
  );
};

//Lista de Pedidos
const OrderList = ({ orders, onSelectOrder }) => {
  return (
    <table className={styles.ordersTable}>
      <thead>
        <tr>
          <th>Cliente (Email)</th>
          <th>Valor Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr
            key={order.id}
            className={styles.orderRow}
            onClick={() => onSelectOrder(order)}
          >
            <td>{order.userEmail}</td>
            <td>
              {order.valorTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </td>
            <td>
              <span
                className={`${styles.statusBadge} ${
                  styles[order.status.toLowerCase()]
                }`}
              >
                {order.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Modal
const OrderDetailsModal = ({ order, onClose, onUpdateStatus }) => {
  if (!order) return null;

  const isShipped = order.status === "Enviado";
  const isDelivered = order.status === "Entregue";

  return (
    <Modal titulo="Detalhes do Pedido" onClose={onClose}>
      <div className={styles.modalBody}>
        <div className={styles.customerInfo}>
          <h3>Endereço de Entrega</h3>
          <p>
            <strong>Email:</strong> {order.userEmail}
          </p>
          <p>
            <strong>Telefone:</strong> {order.endereco.telefone}
          </p>
          <p>
            {order.endereco.logradouro}, {order.endereco.numero}{" "}
            {order.endereco.complemento}
          </p>
          <p>
            {order.endereco.cidade} - {order.endereco.cep}
          </p>
        </div>

        <h3>Produtos</h3>
        <ul className={styles.modalProductList}>
          {order.produtos.map((produto) => (
            <li key={produto.id} className={styles.modalProductItem}>
              <img
                src={produto.imagem}
                alt={produto.nome}
                className={styles.modalProductImage}
              />
              <div className={styles.modalProductDetails}>
                <span className={styles.modalProductName}>{produto.nome}</span>
                <span>
                  {produto.quantidade} x{" "}
                  {produto.precoUnitario.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <span className={styles.modalProductTotal}>
                {(produto.quantidade * produto.precoUnitario).toLocaleString(
                  "pt-BR",
                  { style: "currency", currency: "BRL" }
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. O Rodapé do Modal com os botões */}
      <div className={styles.modalFooter}>
        <div className={styles.modalActions}>
          <button
            className={styles.actionBtnEnv}
            onClick={() => onUpdateStatus(order.id, "Enviado")}
            disabled={isShipped || isDelivered}
          >
            Marcar como Enviado
          </button>
          <button
            className={styles.actionBtnEnt}
            onClick={() => onUpdateStatus(order.id, "Entregue")}
            disabled={isDelivered}
          >
            Marcar como Entregue
          </button>
        </div>
      </div>
    </Modal>
  );
};

//Pedidos
export default function Pedidos() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [filterStatus, setFilterStatus] = useState({
    pago: true,
    Enviado: true,
    Entregue: false,
  });

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "pedidos"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar pedidos: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => {
    const activeFilters = Object.keys(filterStatus).filter(
      (status) => filterStatus[status]
    );
    if (activeFilters.length === 0) {
      return [];
    }
    return allOrders.filter((order) => activeFilters.includes(order.status));
  }, [allOrders, filterStatus]);

  const handleFilterChange = (status, isChecked) => {
    setFilterStatus((prevStatus) => ({
      ...prevStatus,
      [status]: isChecked,
    }));
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const orderRef = doc(db, "pedidos", orderId);
    try {
      await updateDoc(orderRef, {
        status: newStatus,
      });
      setSelectedOrder(null);
    } catch (error) {
      console.error("Erro ao atualizar status: ", error);
      alert("Falha ao atualizar o status do pedido.");
    }
  };

  return (
    <div className={styles.adminContainer}>
      <h1>Gerenciamento de Pedidos</h1>

      <OrderFilters
        filterStatus={filterStatus}
        onFilterChange={handleFilterChange}
      />

      {loading ? (
        <p className={styles.loadingText}>Carregando pedidos...</p>
      ) : (
        <OrderList orders={filteredOrders} onSelectOrder={setSelectedOrder} />
      )}

      {!loading && filteredOrders.length === 0 && (
        <p className={styles.noOrdersMessage}>
          Nenhum pedido encontrado com os filtros selecionados.
        </p>
      )}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
