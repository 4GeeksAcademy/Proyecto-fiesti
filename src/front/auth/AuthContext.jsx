import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    // Lee el token inicial desde sessionStorage pero guárdalo en estado
    const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);
    const [user, setUser] = useState(null); // { id, name, email, role }
    const [loading, setLoading] = useState(true);

    // Carga /api/me cuando haya token
    useEffect(() => {
        const loadMe = async () => {
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Invalid token");
                const data = await res.json(); // { id, name, email, role }
                setUser(data);
            } catch {
                // token inválido o backend caído: limpiar sesión
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadMe();
    }, [token]);

    // Login: recibe { token, user } desde el Login.jsx
    const login = useCallback(({ token: newToken, user: userPayload }) => {
        // Guarda en storage (por si algo externo lo necesita)
        sessionStorage.setItem("token", newToken);
        if (userPayload) {
            sessionStorage.setItem("user", JSON.stringify(userPayload));
            setUser(userPayload); // pinta el Navbar al instante
        } else {
            // si no viene user, lo cargaremos vía /api/me en el useEffect
            sessionStorage.removeItem("user");
        }
        setToken(newToken);
    }, []);

    // Logout global
    const logout = useCallback(() => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }, []);

    // Sincroniza cambios de sesión entre pestañas/codespaces
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === "token") setToken(e.newValue);
            if (e.key === "user" && e.newValue) {
                try {
                    setUser(JSON.parse(e.newValue));
                } catch {
                    setUser(null);
                }
            }
            if (e.key === "user" && e.newValue === null) setUser(null);
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                role: user?.role || null,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}