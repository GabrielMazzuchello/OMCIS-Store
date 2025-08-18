import React from "react";
import styles from "./NavbarAdmin.module.css";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/produtos", label: "Produtos" },
  { to: "/admin/categoria", label: "Categoria" },
  { to: "/admin/pedidos", label: "Pedidos" },
];

const NavbarAdmin = () => {
  return (
    <div className={styles.NavbarAdmin_Container}>
      {links.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  );
};

export default NavbarAdmin;
