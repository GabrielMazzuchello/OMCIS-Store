import React, { useState, useEffect, useMemo } from "react";
import styles from "./GerenciarAdministradores.module.css";
import Modal from "../../components/Modal";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";

const GerenciarAdministradores = () => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);

  const [masterUID, setMasterUID] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    setLoading(true);

    const unsubAdmins = onSnapshot(collection(db, "admins"), (snapshot) => {
      const allAdmins = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const masterAdmin = allAdmins.find((admin) => admin.role === "master");
      if (masterAdmin) {
        setMasterUID(masterAdmin.uid);
      }
      const listaAdmins = allAdmins.filter((admin) => admin.role !== "master");

      setAdmins(listaAdmins);
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const listaUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(listaUsers);
    });

    setLoading(false);

    return () => {
      unsubAdmins();
      unsubUsers();
    };
  }, []);

  const { currentAdmins, regularUsers } = useMemo(() => {
    const adminUIDs = new Set(admins.map((admin) => admin.uid));
    const filteredRegularUsers = users
      .filter((user) => !adminUIDs.has(user.uid))
      .filter((user) => user.uid !== masterUID)
      .filter((user) =>
        user.email.toLowerCase().includes(search.toLowerCase())
      );

    // Filtra a lista de admins (já não tem o master)
    const filteredAdmins = admins.filter((admin) =>
      admin.email.toLowerCase().includes(search.toLowerCase())
    );

    return {
      currentAdmins: filteredAdmins,
      regularUsers: filteredRegularUsers,
    };
  }, [admins, users, search, masterUID]);

  const handlePromote = (user) => {
    setModalConfig({
      isOpen: true,
      title: "Promover Usuário",
      message: `Você tem certeza que deseja promover ${user.email} para "Vendedor"?`,
      onConfirm: async () => {
        await setDoc(doc(db, "admins", user.uid), {
          uid: user.uid,
          email: user.email,
          role: "vendedor",
          createdAt: serverTimestamp(),
        });
        closeModal();
      },
    });
  };

  const handleDemote = (admin) => {
    setModalConfig({
      isOpen: true,
      title: "Rebaixar Administrador",
      message: `Você tem certeza que deseja remover as permissões de ${admin.email}?`,
      onConfirm: async () => {
        await deleteDoc(doc(db, "admins", admin.id));
        closeModal();
      },
    });
  };

  const handleUpdateRole = async (adminId, newRole) => {
    await updateDoc(doc(db, "admins", adminId), { role: newRole });
  };

  const closeModal = () => {
    setModalConfig({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h3>Gerenciar Administradores</h3>
      </div>

      <input
        type="text"
        placeholder="Pesquisar por e-mail..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.search}
      />

      {/* --- LISTA 1: ADMINISTRADORES ATUAIS --- */}
      <div className={styles.header}>
        <h4>Administradores Atuais ({currentAdmins.length})</h4>
      </div>
      <div className={styles.list}>
        {loading && <p>Carregando...</p>}
        {!loading && currentAdmins.length === 0 && (
          <p>Nenhum administrador encontrado.</p>
        )}
        {currentAdmins.map((adm) => (
          <div key={adm.id} className={styles.adminCard}>
            <p>
              {adm.email} <span>({adm.role})</span>
            </p>
            <div className={styles.cardActions}>
              <button
                className={`${styles.btn} ${styles.btnVendedor}`}
                onClick={() => handleUpdateRole(adm.id, "vendedor")}
                disabled={adm.role === "vendedor"}
              >
                Vendedor
              </button>
              <button
                className={`${styles.btn} ${styles.btnEstoque}`}
                onClick={() => handleUpdateRole(adm.id, "estoque")}
                disabled={adm.role === "estoque"}
              >
                Estoque
              </button>
              <button
                className={`${styles.btn} ${styles.btnDemote}`}
                onClick={() => handleDemote(adm)}
              >
                Rebaixar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- LISTA 2: USUÁRIOS COMUNS (para promover) --- */}
      <div className={styles.header} style={{ marginTop: "30px" }}>
        <h4>Usuários Comuns ({regularUsers.length})</h4>
      </div>
      <div className={styles.list}>
        {loading && <p>Carregando...</p>}
        {!loading && regularUsers.length === 0 && (
          <p>Nenhum usuário comum encontrado.</p>
        )}
        {regularUsers.map((user) => (
          <div key={user.id} className={styles.adminCard}>
            <p>{user.email}</p>
            <div className={styles.cardActions}>
              <button
                className={`${styles.btn} ${styles.btnPromote}`}
                onClick={() => handlePromote(user)}
              >
                Promover
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      {modalConfig.isOpen && (
        <Modal titulo={modalConfig.title} onClose={closeModal}>
          <p>{modalConfig.message}</p>
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={closeModal}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.btnConfirm}
              onClick={modalConfig.onConfirm}
            >
              Confirmar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GerenciarAdministradores;
