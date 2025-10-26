import React from "react";
import styles from "./Auth.module.css";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setError("✅ Login realizado com sucesso!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setError("✅ Conta criada com sucesso!");
      }
      setTimeout(() => {
        setError("");
        navigate("/");
      }, 2000);
    } catch (error) {
      setError(error.message.replace("Firebase: ", ""));
    }
  };

  return (
    <div className={styles.authContainer}>
      {error && <div className={styles.popupLogin_error}>{error}</div>}
      <form className={styles.formLogin} onSubmit={handleAuth}>
        <h1>{isLogin ? "Login" : "Criar conta"}</h1>
        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className={styles.formLogin_button} type="submit">
          {isLogin ? "Login" : "Cadastrar"}
        </button>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Não tem conta? Cadastre-se"
            : "Ja tem uma conta? Faça login"}
        </button>
      </form>
    </div>
  );
};

export default Auth;
