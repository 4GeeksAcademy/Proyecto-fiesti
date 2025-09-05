import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
    const { token } = useAuth();
    const effectiveToken = token || sessionStorage.getItem("token"); // fallback
    if (!effectiveToken) return <Navigate to="/login" replace />;
    return <Outlet />;
}