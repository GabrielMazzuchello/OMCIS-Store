import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Login from "./pages/auth/Auth";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Login></Login>
    </div>
  );
}

export default App;
