import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import Dashboard from "./Dashboard.tsx";
import "./index.css";

// Tiny pathname-based router so /dashboard mounts the Dashboard component
// without pulling in react-router. Marketing site stays the default.
const path = window.location.pathname;
const isDashboard = path === "/dashboard" || path.startsWith("/dashboard/");

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isDashboard ? <Dashboard /> : <App />}</StrictMode>
);
