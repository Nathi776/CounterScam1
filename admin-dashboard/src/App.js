import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import AppShell from "./components/AppShell";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentView, setCurrentView] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <AppShell
      title={currentView === "reports" ? "Reported Scams" : "Admin Dashboard"}
      onRefresh={handleRefresh}
      onLogout={handleLogout}
      currentView={currentView}
      setCurrentView={setCurrentView}
    >
      {currentView === "reports" ? <Reports /> : <Dashboard />}
    </AppShell>
  );
}

export default App;