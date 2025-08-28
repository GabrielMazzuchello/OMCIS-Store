import React, { useState, useEffect } from "react";
import styles from "./Categoria.module.css";
import { db } from "../../services/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

const CategoriaPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categorias"), (snapshot) => {
      setCategorias(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  const handleAdicionar = async () => {
    const nome = prompt("Digite o nome da nova categoria:");
    
    if (nome) {
      await addDoc(collection(db, "categorias"), { nome });
    }
  };

  const handleEditar = async (id, nomeAtual) => {
    const novoNome = prompt("Digite o novo nome da categoria:", nomeAtual);
    if (novoNome) {
      const ref = doc(db, "categorias", id);
      await updateDoc(ref, { nome: novoNome });
    }
  };

  const handleRemover = async (id) => {
    if (window.confirm("Tem certeza que deseja remover esta categoria?")) {
      const ref = doc(db, "categorias", id);
      await deleteDoc(ref);
    }
  };

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="header_container">
        <span>Categorias</span>
        <button
          className={styles.btn + " " + styles.btnEdit}
          onClick={handleAdicionar}
        >
          + Nova Categoria
        </button>
      </div>

      {/* Campo de busca */}
      <input
        type="text"
        placeholder="Pesquisar categoria..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={{
          marginTop: "15px",
          padding: "8px",
          width: "100%",
          borderRadius: "8px",
          border: "2px solid var(--border-color)",
          backgroundColor: "var(--bg-body)",
          color: "var(--color-text)",
        }}
      />

      {/* Lista em Cards */}
      <div className={styles.cardGrid}>
        {categoriasFiltradas.map((cat) => (
          <div key={cat.id} className={styles.card}>
            <div className={styles.cardTitle}>{cat.nome}</div>
            <div className={styles.cardActions}>
              <button
                className={styles.btn + " " + styles.btnEdit}
                onClick={() => handleEditar(cat.id, cat.nome)}
              >
                Editar
              </button>
              <button
                className={styles.btn + " " + styles.btnRemove}
                onClick={() => handleRemover(cat.id)}
              >
                Remover
              </button>
            </div>
          </div>
        ))}
        {categoriasFiltradas.length === 0 && (
          <p style={{ marginTop: "20px", textAlign: "center" }}>
            Nenhuma categoria encontrada.
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoriaPage;
