import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate(); // hook para navegação

  return (
    <div>
      <h1>home</h1>
      <button onClick={() => navigate("/Auth")}>Login</button>
    </div>
  );
};

export default Home;
