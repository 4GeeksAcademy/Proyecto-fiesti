import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleRoute({ allow = [] }) {
    const { role } = useAuth();
    const storedUser = (() => {
        try { return JSON.parse(sessionStorage.getItem("user") || "null"); }
        catch { return null; }
    })();
    const effectiveRole = role || storedUser?.role;

    if (!effectiveRole) return <Navigate to="/login" replace />;
    if (!allow.includes(effectiveRole)) return <Navigate to="/festi" replace />;
    return <Outlet />;
}