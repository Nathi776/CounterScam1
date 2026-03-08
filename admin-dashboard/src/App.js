import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Reports from "./pages/Reports";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  if (!token) return <Login setToken={setToken} />;

  const isReportsPage = window.location.hash === "#reports";

  return isReportsPage ? <Reports /> : <Dashboard />;
}

export default App;