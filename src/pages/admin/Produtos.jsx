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
  const [categorias, setCategorias] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [tamanhoAtual, setTamanhoAtual] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categorias"), (snapshot) => {
      setCategorias(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "produtos"), (snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddTamanho = () => {
    if (tamanhoAtual.trim() !== "" && !tamanhos.includes(tamanhoAtual.trim())) {
      setTamanhos([...tamanhos, tamanhoAtual.trim()]);
      setTamanhoAtual("");
    }
  };

  const handleRemoveTamanho = (tamanhoParaRemover) => {
    setTamanhos(tamanhos.filter((t) => t !== tamanhoParaRemover));
  };

  const abrirAdicionar = () => setModal({ tipo: "adicionar" });
  const abrirEditar = (prod) => {
    setModal({ tipo: "editar", data: prod });
    setTamanhos(prod.tamanhos || []);
  };
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
            {prod.imagem && (
              <img
                src={prod.imagem}
                alt={prod.nome}
                className={styles.cardImage}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
            <div className={styles.cardinfo}>
              <div className={styles.cardTitle}>{prod.nome}</div>
              <p className={styles.cardText}>Preço: R$ {prod.preco}</p>
              <p className={styles.cardText}>Estoque: {prod.quantidade}</p>
              {prod.tamanhos && prod.tamanhos.length > 0 && (
                <p className={styles.cardText}>
                  Tamanhos: {prod.tamanhos.join(", ")}
                </p>
              )}
            </div>

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
              const categoria = e.target.categoria.value;
              const custo = parseFloat(e.target.custo.value);
              const minEstoque = parseInt(e.target.minEstoque.value);
              const imagem = e.target.imagem.value.trim();
              const status = e.target.status.value === "ativo";

              if (!nome || isNaN(preco)) return;

              await addDoc(collection(db, "produtos"), {
                nome,
                categoria,
                custo: isNaN(custo) ? 0 : custo,
                preco,
                quantidade: isNaN(quantidade) ? 0 : quantidade,
                minEstoque: isNaN(minEstoque) ? 0 : minEstoque,
                tamanhos: tamanhos,
                status,
                imagem: imagem || "",
                createdAt: new Date(),
              });

              abrirFeedback("Produto criado", `"${nome}" foi adicionado.`);
              setModal({ tipo: null });
            }}
          >
            <label>Categoria</label>
            <select name="categoria" className={styles.input} required>
              <option value="">Selecione uma categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>

            <label>Nome</label>
            <input name="nome" className={styles.input} autoFocus required />

            <label>Custo</label>
            <input
              name="custo"
              type="number"
              step="0.01"
              className={styles.input}
            />

            <label>Preço</label>
            <input
              name="preco"
              type="number"
              step="0.01"
              className={styles.input}
              required
            />

            <label>Tamanhos</label>
            <div className={styles.tamanhosContainer}>
              <input
                name="tamanho"
                type="text"
                className={styles.input}
                value={tamanhoAtual}
                onChange={(e) => setTamanhoAtual(e.target.value)}
                placeholder="Ex: P, M, 42..."
              />
              <button
                type="button"
                onClick={handleAddTamanho}
                className={styles.btn}
              >
                Add
              </button>
            </div>
            <div className={styles.tamanhosList}>
              {tamanhos.map((t, index) => (
                <div key={index} className={styles.tamanhoTag}>
                  {t}
                  <button type="button" onClick={() => handleRemoveTamanho(t)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <label>Estoque mínimo</label>
            <input name="minEstoque" type="number" className={styles.input} />

            <label>Estoque</label>
            <input name="quantidade" type="number" className={styles.input} />

            {/* Imagem */}
            <label>Imagem (URL)</label>
            <input name="imagem" type="url" className={styles.input} />

            <label>Status</label>
            <div className={styles.status}>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="ativo"
                  defaultChecked
                />{" "}
                Ativo
              </label>
              <label>
                <input type="radio" name="status" value="inativo" /> Inativo
              </label>
            </div>

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
              const categoria = e.target.categoria.value;
              const custo = parseFloat(e.target.custo.value);
              const minEstoque = parseInt(e.target.minEstoque.value);
              const imagem = e.target.imagem.value.trim();
              const status = e.target.status.value === "ativo";

              if (!nome || isNaN(preco)) return;

              const ref = doc(db, "produtos", modal.data.id);
              await updateDoc(ref, {
                nome,
                categoria,
                custo: isNaN(custo) ? 0 : custo,
                preco,
                quantidade: isNaN(quantidade) ? 0 : quantidade,
                minEstoque: isNaN(minEstoque) ? 0 : minEstoque,
                tamanhos: tamanhos,
                status,
                imagem: imagem || "",
                updatedAt: new Date(),
              });

              abrirFeedback("Produto atualizado", `"${nome}" foi alterado.`);
              setModal({ tipo: null });
              setTamanhos([]);
            }}
          >
            <label>Categoria</label>
            <select
              name="categoria"
              className={styles.input}
              defaultValue={modal.data.categoria || ""}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>

            <label>Nome</label>
            <input
              name="nome"
              defaultValue={modal.data.nome}
              className={styles.input}
              autoFocus
              required
            />

            <label>Custo</label>
            <input
              name="custo"
              type="number"
              step="0.01"
              defaultValue={modal.data.custo}
              className={styles.input}
            />

            <label>Preço</label>
            <input
              name="preco"
              type="number"
              step="0.01"
              defaultValue={modal.data.preco}
              className={styles.input}
              required
            />

            <label>Tamanhos</label>
            <div className={styles.tamanhosContainer}>
              <input
                name="tamanho"
                type="text"
                className={styles.input}
                value={tamanhoAtual}
                onChange={(e) => setTamanhoAtual(e.target.value)}
                placeholder="Ex: P, M, 42..."
              />
              <button
                type="button"
                onClick={handleAddTamanho}
                className={styles.btn}
              >
                Add
              </button>
            </div>
            <div className={styles.tamanhosList}>
              {tamanhos.map((t, index) => (
                <div key={index} className={styles.tamanhoTag}>
                  {t}
                  <button type="button" onClick={() => handleRemoveTamanho(t)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <label>Estoque mínimo</label>
            <input
              name="minEstoque"
              type="number"
              defaultValue={modal.data.minEstoque}
              className={styles.input}
            />

            <label>Quantidade</label>
            <input
              name="quantidade"
              type="number"
              defaultValue={modal.data.quantidade}
              className={styles.input}
            />

            {/* Imagem */}
            <label>Imagem (URL)</label>
            <input
              name="imagem"
              type="url"
              defaultValue={modal.data.imagem || ""}
              className={styles.input}
            />

            <label>Status</label>
            <div className={styles.status}>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="ativo"
                  defaultChecked={modal.data.status === true}
                />{" "}
                Ativo
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="inativo"
                  defaultChecked={modal.data.status === false}
                />{" "}
                Inativo
              </label>
            </div>

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
