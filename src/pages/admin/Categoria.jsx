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
import Modal from "../../components/Modal";

const CategoriaPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState({ tipo: null, data: null });

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

  // ---------- Handlers ----------
  const abrirAdicionar = () => setModal({ tipo: "adicionar" });
  const abrirEditar = (cat) => setModal({ tipo: "editar", data: cat });
  const abrirRemover = (cat) => setModal({ tipo: "remover", data: cat });
  const abrirFeedback = (titulo, mensagem) =>
    setModal({ tipo: "feedback", data: { titulo, mensagem } });

  // ---------- Categorias filtradas ----------
  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header_container}>
        <h2>Categorias</h2>
        <button
          className={styles.btn + " " + styles.btnEdit}
          onClick={abrirAdicionar}
        >
          + Nova Categoria
        </button>
      </div>

      <input
        type="text"
        placeholder="Pesquisar categoria..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={{
          marginTop: "15px",
          padding: "8px",
          width: "100%",
          boxSizing: "border-box",
          borderRadius: "8px",
          border: "2px solid var(--border-color)",
          backgroundColor: "var(--bg-body)",
          color: "var(--color-text)",
        }}
      />

      <div className={styles.cardGrid}>
        {categoriasFiltradas.map((cat) => (
          <div key={cat.id} className={styles.card}>
            <div className={styles.cardTitle}>
              <h1>{cat.nome}</h1>
            </div>
            <div className={styles.cardActions}>
              <button
                className={styles.btn + " " + styles.btnEdit}
                onClick={() => abrirEditar(cat)}
              >
                Editar
              </button>
              <button
                className={styles.btn + " " + styles.btnRemove}
                onClick={() => abrirRemover(cat)}
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

      {/* ---------- Modal genérico ---------- */}
      {modal.tipo === "adicionar" && (
        <Modal titulo="Nova Categoria" onClose={() => setModal({ tipo: null })}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const nome = e.target.nome.value.trim();
              if (!nome) return;
              await addDoc(collection(db, "categorias"), { nome });
              abrirFeedback(
                "Categoria criada",
                `Categoria "${nome}" adicionada.`
              );
              setModal({ tipo: null });
            }}
          >
            <label>Nome da categoria</label>
            <input name="nome" className={styles.input} autoFocus />
            <div className={styles.actions}>
              <button type="submit" className={styles.btnConfirm}>
                Criar
              </button>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setModal({ tipo: null })}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal.tipo === "editar" && (
        <Modal
          titulo="Editar Categoria"
          onClose={() => setModal({ tipo: null })}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const nome = e.target.nome.value.trim();
              if (!nome) return;
              const ref = doc(db, "categorias", modal.data.id);
              await updateDoc(ref, { nome });
              abrirFeedback("Categoria atualizada", `Renomeada para "${nome}"`);
              setModal({ tipo: null });
            }}
          >
            <label>Novo nome</label>
            <input
              name="nome"
              defaultValue={modal.data.nome}
              className={styles.input}
              autoFocus
            />
            <div className={styles.actions}>
              <button type="submit" className={styles.btnConfirm}>
                Salvar
              </button>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setModal({ tipo: null })}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal.tipo === "remover" && (
        <Modal
          titulo="Remover Categoria"
          onClose={() => setModal({ tipo: null })}
        >
          <p>Tem certeza que deseja remover a categoria "{modal.data.nome}"?</p>
          <div className={styles.actions}>
            <button
              className={styles.btnCancel}
              onClick={async () => {
                const ref = doc(db, "categorias", modal.data.id);
                await deleteDoc(ref);
                abrirFeedback(
                  "Categoria removida",
                  `A categoria "${modal.data.nome}" foi removida.`
                );
                setModal({ tipo: null });
              }}
            >
              Remover
            </button>
            <button
              className={styles.btnConfirm}
              onClick={() => setModal({ tipo: null })}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {modal.tipo === "feedback" && (
        <Modal
          titulo={modal.data.titulo}
          onClose={() => setModal({ tipo: null })}
        >
          <p>{modal.data.mensagem}</p>
          <button
            className={styles.btnConfirm}
            onClick={() => setModal({ tipo: null })}
          >
            OK
          </button>
        </Modal>
      )}
    </div>
  );
};

export default CategoriaPage;
