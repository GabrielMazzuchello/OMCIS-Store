import React, { useState, useEffect } from "react";
import styles from "./GerenciarAdministradores.module.css";
// ALTERAÇÃO 2: Novos imports para a criação de usuário sem login
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
// Adicionamos firebaseConfig ao import
import { db, firebaseConfig } from "../../services/firebase";

const GerenciarAdministradores = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("vendedor");
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "admins"), (snapshot) => {
      const lista = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        // ALTERAÇÃO 1: Filtra para não exibir a role 'master'
        .filter((admin) => admin.role !== "master");

      setAdmins(lista);
    });

    return () => unsub();
  }, []);

  // ALTERAÇÃO 2: Função de criar admin modificada
  const handleCreateAdm = async (e) => {
    e.preventDefault();
    const tempAppName = `temp-app-creation-${Date.now()}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth, // Usa a instância temporária
        email,
        password
      );

      await addDoc(collection(db, "admins"), {
        uid: userCredential.user.uid,
        email,
        role,
        createdAt: serverTimestamp(),
      });

      setEmail("");
      setPassword("");
      setRole("vendedor");
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao criar administrador:", error);
    } finally {
      // Limpa a instância temporária do app
      await deleteApp(tempApp);
    }
  };

  const handleDeleteAdm = async (id) => {
    await deleteDoc(doc(db, "admins", id));
  };

  const handleUpdateRole = async (id, newRole) => {
    await updateDoc(doc(db, "admins", id), { role: newRole });
  };

  const filteredAdmins = admins.filter((adm) =>
    (adm.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {/* O resto do seu JSX permanece o mesmo */}
      <div className={styles.header}>
        <h3>Gerenciar Administradores</h3>
        <button onClick={() => setShowModal(true)}>+ Novo Administrador</button>
      </div>

      <input
        type="text"
        placeholder="Pesquisar admin..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.search}
      />

      <div className={styles.list}>
        {filteredAdmins.map((adm) => (
          <div key={adm.id} className={styles.adminCard}>
            <p>{adm.email}</p>
            <p>Role: {adm.role}</p>
            <button onClick={() => handleUpdateRole(adm.id, "vendedor")}>
              Vendedor
            </button>
            <button onClick={() => handleUpdateRole(adm.id, "estoque")}>
              Estoque
            </button>
            <button onClick={() => handleDeleteAdm(adm.id)}>Excluir</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2>Novo Administrador</h2>
            <form onSubmit={handleCreateAdm}>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className={styles.roleBtns}>
                <button
                  type="button"
                  className={role === "vendedor" ? styles.active : ""}
                  onClick={() => setRole("vendedor")}
                >
                  Vendedor
                </button>
                <button
                  type="button"
                  className={role === "estoque" ? styles.active : ""}
                  onClick={() => setRole("estoque")}
                >
                  Estoque
                </button>
              </div>
              <div className={styles.modalActions}>
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarAdministradores;
