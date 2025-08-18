import React from "react";
import styles from "./Produtos.module.css";

const Produtos = () => {
  return (
    <div>
      <div>
        <input
          className={styles.products_search}
          id="search-products"
          type="search"
        />
        <button>Buscar</button>
      </div>
    </div>
  );
};

export default Produtos;
