import React from "react";
import NavbarAdmin from "../../components/NavbarAdmin";
import { NavLink, Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header_container}>
        <NavLink className={styles.navLink} to={"/"}>
          OMCIS Store
        </NavLink>
        <h3 className={styles.text}>Painel Administrativo</h3>
      </header>
      <div className={styles.content}>
        <div className={styles.navbar}>
          <NavbarAdmin />
        </div>
        <div className={styles.page}>
          <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
