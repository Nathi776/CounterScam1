import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Login from "./pages/Login";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [view, setView] = useState("dashboard");

  if (!token) {
    return <Login setToken={setToken} />;
  }

  if (view === "reports") {
    return <Reports setView={setView} />;
  }

  return <Dashboard setView={setView} />;
}

export default App;
