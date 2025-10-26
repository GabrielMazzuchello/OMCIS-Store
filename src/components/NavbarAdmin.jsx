import React, { useState, useEffect } from "react";
import styles from "./NavbarAdmin.module.css";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  ShieldUser,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

const allLinks = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
    roles: ["master"],
  },
  {
    to: "/admin/produtos",
    label: "Produtos",
    icon: Package,
    roles: ["master", "vendedor"],
  },
  {
    to: "/admin/categoria",
    label: "Categoria",
    icon: Tags,
    roles: ["master", "vendedor"],
  },
  {
    to: "/admin/pedidos",
    label: "Pedidos",
    icon: ShoppingCart,
    roles: ["master", "estoque"],
  },
  {
    to: "/admin/newAdmins",
    label: "Administradores",
    icon: ShieldUser,
    roles: ["master"],
  },
];

const NavbarAdmin = () => {
  const { currentUser: user, loading: authLoading } = useAuth();

  const [roleLoading, setRoleLoading] = useState(true);
  const [filteredLinks, setFilteredLinks] = useState([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!authLoading && user) {
        try {
          const adminsCollectionRef = collection(db, "admins");
          const q = query(adminsCollectionRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const adminDoc = querySnapshot.docs[0];
            const role = adminDoc.data().role;

            console.log("Role encontrada:", role); // verifique se a role correta aparece aqui

            const accessibleLinks = allLinks.filter((link) =>
              link.roles.includes(role)
            );
            setFilteredLinks(accessibleLinks);
          } else {
            console.log("Nenhum documento de admin encontrado para este UID.");
            setFilteredLinks([]);
          }
        } catch (error) {
          console.error("Erro ao buscar a role do usuário:", error);
          setFilteredLinks([]);
        } finally {
          setRoleLoading(false);
        }
      } else if (!authLoading && !user) {
        setRoleLoading(false);
        setFilteredLinks([]);
      }
    };

    fetchUserRole();
  }, [user, authLoading]);

  if (authLoading || roleLoading) {
    return <div className={styles.NavbarAdmin_Container}>Carregando...</div>;
  }

  return (
    <div className={styles.NavbarAdmin_Container}>
      {filteredLinks.map(({ to, label, icon: Icon, end }) => (
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
