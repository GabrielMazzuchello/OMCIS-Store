import React from "react";
import styles from "./CartDrawer.module.css";

const CartDrawer = ({ isOpen, onClose, cartItems }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div>
      <p>tem porra nenhuma aq</p>
    </div>
  );
};

export default CartDrawer;
