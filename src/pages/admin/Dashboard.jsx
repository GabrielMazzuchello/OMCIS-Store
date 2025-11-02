// src/pages/admin/Dashboard.js

import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase"; // Ajuste o caminho
import styles from "./Dashboard.module.css";

// Importando 'date-fns' para manipular datas
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  isWithinInterval,
  subDays,
} from "date-fns";

// Importando os sub-componentes que vamos criar
import StatsCard from "../../components/StatsCard";
import TopSellingProducts from "../../components/TopSellingProducts";

// --- COMPONENTE PRINCIPAL ---
const Dashboard = () => {
  const [allOrders, setAllOrders] = useState([]);
  // REMOVIDO: const [newUsersCount, setNewUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // 1. Busca todos os pedidos em tempo real
    const ordersQuery = query(collection(db, "pedidos"));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convertendo o Timestamp do Firebase para um objeto Date
        createdAt: doc.data().createdAt.toDate() 
      }));
      setAllOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar pedidos:", error);
      setLoading(false);
    });

    // 2. Busca por usuários (REMOVIDA)

    // Limpa o listener de pedidos
    return () => {
      unsubOrders();
    };
  }, []);

  // 3. Calcula os KPIs de Receita usando useMemo
  const revenueStats = useMemo(() => {
    const now = new Date();
    
    // Define os intervalos de data
    const weekInterval = { start: startOfWeek(now), end: now };
    const monthInterval = { start: startOfMonth(now), end: now };
    const yearInterval = { start: startOfYear(now), end: now };

    // Filtra os pedidos para cada intervalo
    const weeklyOrders = allOrders.filter(o => isWithinInterval(o.createdAt, weekInterval));
    const monthlyOrders = allOrders.filter(o => isWithinInterval(o.createdAt, monthInterval));
    const yearlyOrders = allOrders.filter(o => isWithinInterval(o.createdAt, yearInterval));

    // Soma os totais
    const calcTotal = (orders) => orders.reduce((acc, order) => acc + order.valorTotal, 0);

    return {
      week: calcTotal(weeklyOrders),
      month: calcTotal(monthlyOrders),
      year: calcTotal(yearlyOrders),
    };
  }, [allOrders]); // Recalcula apenas quando 'allOrders' mudar

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1>Dashboard</h1>
      
      {/* --- Retângulos de Valor --- */}
      <div className={styles.statsGrid}>
        <StatsCard
          title="Receita (Semana)"
          value={formatCurrency(revenueStats.week)}
          loading={loading}
        />
        <StatsCard
          title="Receita (Mês)"
          value={formatCurrency(revenueStats.month)}
          loading={loading}
        />
        <StatsCard
          title="Receita (Ano)"
          value={formatCurrency(revenueStats.year)}
          loading={loading}
        />
        {/* Card de Novos Usuários REMOVIDO */}
      </div>
      
      {/* --- Produtos Mais Vendidos --- */}
      <TopSellingProducts orders={allOrders} loading={loading} />

    </div>
  );
};

export default Dashboard;