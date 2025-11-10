import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subDays, startOfDay, endOfDay } from "date-fns";
import styles from "../pages/admin/Dashboard.module.css"; 

const TopSellingProducts = ({ orders, loading }) => {
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const topSellers = useMemo(() => {
    // 1. Filtra os pedidos pelo intervalo de data selecionado
    const filteredOrders = orders.filter((o) => {
      const orderDate = o.createdAt;
      return (
        orderDate >= startOfDay(startDate) && orderDate <= endOfDay(endDate)
      );
    });

    const productSales = new Map();
    for (const order of filteredOrders) {
      for (const product of order.produtos) {
        const existing = productSales.get(product.id) || {
          ...product,
          totalSold: 0,
        };
        existing.totalSold += product.quantidade;
        productSales.set(product.id, existing);
      }
    }

    let sortedSellers = Array.from(productSales.values()).sort(
      (a, b) => b.totalSold - a.totalSold
    );

    if (searchTerm) {
      sortedSellers = sortedSellers.filter((p) =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return sortedSellers.slice(0, 4);
  }, [orders, startDate, endDate, searchTerm]);

  return (
    <div className={styles.topSellersContainer}>
      <h2>Top 4 Produtos Mais Vendidos</h2>

      {/* Filtros de Data e Pesquisa */}
      <div className={styles.productFilters}>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="dd/MM/yyyy"
          className={styles.datePicker}
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="dd/MM/yyyy"
          className={styles.datePicker}
        />
        <input
          type="text"
          placeholder="Pesquisar por nome..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Produtos */}
      <div className={styles.productList}>
        {loading ? (
          <p>Calculando...</p>
        ) : topSellers.length === 0 ? (
          <p>Nenhum produto vendido neste período.</p>
        ) : (
          topSellers.map((product, index) => (
            <div key={product.id || index} className={styles.productItem}>
              <span className={styles.productRank}>#{index + 1}</span>
              <img
                src={product.imagem}
                alt={product.nome}
                className={styles.productImage}
              />
              <span className={styles.productName}>{product.nome}</span>
              <span className={styles.productSold}>
                {product.totalSold} vendidos
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopSellingProducts;
 