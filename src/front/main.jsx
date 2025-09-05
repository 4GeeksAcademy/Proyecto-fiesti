import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; 
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { StoreProvider } from "./hooks/useGlobalReducer";
import { BackendURL } from "./components/BackendURL";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from "../ThemeContext";  

const Main = () => {
  if (!import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL === "") {
    return <BackendURL />;
  }

  return (
    <ThemeProvider>
      <StoreProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
};

// Renderizar en #root
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
