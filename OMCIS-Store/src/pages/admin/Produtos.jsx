import React, { useState, useEffect } from "react";
import styles from "./Produtos.module.css";
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

const Produtos = () => {
  const [products, setProducts] = useState([]);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState({ tipo: null, data: null });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "produtos"), (snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const abrirAdicionar = () => setModal({ tipo: "adicionar" });
  const abrirEditar = (prod) => setModal({ tipo: "editar", data: prod });
  const abrirRemover = (prod) => setModal({ tipo: "remover", data: prod });
  const abrirFeedback = (titulo, mensagem) =>
    setModal({ tipo: "feedback", data: { titulo, mensagem } });

  const produtosFiltrados = products.filter((p) =>
    p.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header_container}>
        <h2>Produtos</h2>
        <button
          className={styles.btn + " " + styles.btnEdit}
          onClick={abrirAdicionar}
        >
          + Novo Produto
        </button>
      </div>

      <input
        type="text"
        placeholder="Pesquisar produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className={styles.searchInput}
      />

      <div className={styles.cardGrid}>
        {produtosFiltrados.map((prod) => (
          <div key={prod.id} className={styles.card}>
            <img
              src={Array.isArray(prod.imagens) ? prod.imagens[0] : prod.imagens}
              alt={prod.nome}
              className={styles.cardImage}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div className={styles.cardTitle}>{prod.nome}</div>
            <p className={styles.cardText}>Preço: R$ {prod.preco}</p>
            <p className={styles.cardText}>Estoque: {prod.quantidade}</p>
            <div className={styles.cardActions}>
              <button
                className={styles.btn + " " + styles.btnEdit}
                onClick={() => abrirEditar(prod)}
              >
                Editar
              </button>
              <button
                className={styles.btn + " " + styles.btnRemove}
                onClick={() => abrirRemover(prod)}
              >
                Remover
              </button>
            </div>
          </div>
        ))}
        {produtosFiltrados.length === 0 && (
          <p style={{ marginTop: "20px", textAlign: "center" }}>
            Nenhum produto encontrado.
          </p>
        )}
      </div>

      {/* ---------- Modal de adicionar ---------- */}
      {modal.tipo === "adicionar" && (
        <Modal titulo="Novo Produto" onClose={() => setModal({ tipo: null })}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const nome = e.target.nome.value.trim();
              const preco = parseFloat(e.target.preco.value);
              const quantidade = parseInt(e.target.quantidade.value);
              if (!nome || isNaN(preco)) return;

              await addDoc(collection(db, "produtos"), {
                nome,
                preco,
                quantidade,
                status: false,
                imagens: [],
              });
              abrirFeedback("Produto criado", `"${nome}" foi adicionado.`);
              setModal({ tipo: null });
            }}
          >
            <label>Nome</label>
            <input name="nome" className={styles.input} autoFocus />
            <label>Preço</label>
            <input name="preco" type="number" step="0.01" className={styles.input} />
            <label>Quantidade</label>
            <input name="quantidade" type="number" className={styles.input} />
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

      {/* ---------- Modal de editar ---------- */}
      {modal.tipo === "editar" && (
        <Modal titulo="Editar Produto" onClose={() => setModal({ tipo: null })}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const nome = e.target.nome.value.trim();
              const preco = parseFloat(e.target.preco.value);
              const quantidade = parseInt(e.target.quantidade.value);

              const ref = doc(db, "produtos", modal.data.id);
              await updateDoc(ref, { nome, preco, quantidade });
              abrirFeedback("Produto atualizado", `"${nome}" foi alterado.`);
              setModal({ tipo: null });
            }}
          >
            <label>Nome</label>
            <input
              name="nome"
              defaultValue={modal.data.nome}
              className={styles.input}
              autoFocus
            />
            <label>Preço</label>
            <input
              name="preco"
              type="number"
              step="0.01"
              defaultValue={modal.data.preco}
              className={styles.input}
            />
            <label>Quantidade</label>
            <input
              name="quantidade"
              type="number"
              defaultValue={modal.data.quantidade}
              className={styles.input}
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

      {/* ---------- Modal de remover ---------- */}
      {modal.tipo === "remover" && (
        <Modal
          titulo="Remover Produto"
          onClose={() => setModal({ tipo: null })}
        >
          <p>Tem certeza que deseja remover "{modal.data.nome}"?</p>
          <div className={styles.actions}>
            <button
              className={styles.btnCancel}
              onClick={async () => {
                const ref = doc(db, "produtos", modal.data.id);
                await deleteDoc(ref);
                abrirFeedback(
                  "Produto removido",
                  `"${modal.data.nome}" foi excluído.`
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

      {/* ---------- Feedback ---------- */}
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

export default Produtos;
