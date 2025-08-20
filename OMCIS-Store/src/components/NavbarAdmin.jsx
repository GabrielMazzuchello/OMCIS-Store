import React from "react";
import styles from "./NavbarAdmin.module.css";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  ShieldUser,
  icons,
  Icon,
} from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categoria", label: "Categoria", icon: Tags },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  {
    to: "/admin/newAdmins",
    label: "Administradores",
    icon: ShieldUser,
  },
];

const NavbarAdmin = () => {
  return (
    <div className={styles.NavbarAdmin_Container}>
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          <Icon className={styles.icon} />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default NavbarAdmin;
