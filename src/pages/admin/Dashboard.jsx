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

import StatsCard from "../../components/StatsCard";
import TopSellingProducts from "../../components/TopSellingProducts";

const Dashboard = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const ordersQuery = query(collection(db, "pedidos"));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate() 
      }));
      setAllOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar pedidos:", error);
      setLoading(false);
    });
    return () => {
      unsubOrders();
    };
  }, []);
  const revenueStats = useMemo(() => {
    const now = new Date();
    
    const weekInterval = { start: startOfWeek(now), end: now };
    const monthInterval = { start: startOfMonth(now), end: now };
    const yearInterval = { start: startOfYear(now), end: now };

    const weeklyOrders = allOrders.filter(o => isWithinInterval(o.createdAt, weekInterval));
    const monthlyOrders = allOrders.filter(o => isWithinInterval(o.createdAt, monthInterval));
    const yearlyOrders = allOrders.filter(o => isWithinInterval(o.createdAt, yearInterval));

    const calcTotal = (orders) => orders.reduce((acc, order) => acc + order.valorTotal, 0);

    return {
      week: calcTotal(weeklyOrders),
      month: calcTotal(monthlyOrders),
      year: calcTotal(yearlyOrders),
    };
  }, [allOrders]);

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
      </div>
      
      <TopSellingProducts orders={allOrders} loading={loading} />

    </div>
  );
};

export default Dashboard;