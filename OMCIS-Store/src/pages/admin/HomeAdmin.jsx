import React from "react";
import { useNavigate } from "react-router-dom";

const HomeAdmin = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Home dos admin</h1>
      <button onClick={() => navigate("/Produtos")}>Produtos</button>
    </div>
  );
};

export default HomeAdmin;
