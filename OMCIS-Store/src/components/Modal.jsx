import React from "react";
import styles from "./Modal.module.css";

const Modal = ({ titulo, children, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{titulo}</h2>
        <div className={styles.content}>{children}</div>
        <button className={styles.btnClose} onClick={onClose}>X</button>
      </div>
    </div>
  );
};

export default Modal;
