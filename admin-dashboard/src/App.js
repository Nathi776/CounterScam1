import React, { useState } from "react";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Reports from "./pages/Reports";
import TrainingData from "./pages/TrainingData";
import Analytics from "./pages/Analytics";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [view, setView] = useState("overview");

  if (!token) {
    return <Login setToken={setToken} />;
  }

  switch (view) {
    case "reports":
      return <Reports setView={setView} />;
    case "training":
      return <TrainingData setView={setView} />;
    case "analytics":
      return <Analytics setView={setView} />;
    case "overview":
    default:
      return <Overview setView={setView} />;
  }
}

export default App;