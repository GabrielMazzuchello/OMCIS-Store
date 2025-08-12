import React from "react";
import "./Auth.css";
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
    <div className="auth-container">
      <h1>{isLogin ? "Login" : "Criar conta"}</h1>

      <form className="form-login" onSubmit={handleAuth}>
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

        <button type="submit">{isLogin ? "Login" : "Cadastrar"}</button>
      </form>

      <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
        {isLogin
          ? "Não tem conta? Cadastre-se"
          : "Ja tem uma conta? Faça login"}
      </button>

      {error && <div className="popup-login_error">{error}</div>}
    </div>
  );
};

export default Auth;
