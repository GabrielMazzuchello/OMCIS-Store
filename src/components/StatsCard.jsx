import React from 'react';
import styles from '../pages/admin/Dashboard.module.css';
const StatsCard = ({ title, value, loading }) => {
  return (
    <div className={styles.statsCard}>
      <h3>{title}</h3>
      {loading ? (
        <div className={styles.loadingSpinner}></div>
      ) : (
        <p>{value}</p>
      )}
    </div>
  );
};

export default StatsCard;