import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMsg("");
        setLoading(true);

        try {
            const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            const data = await resp.json().catch(() => ({}));

            if (!resp.ok) {
                setMsg(data.msg || "❌ Error al iniciar sesión");
                setLoading(false);
                return;
            }

            const token = data.access_token || data.token || "LOGGED_IN";
            sessionStorage.setItem("token", token);
            if (data.user) sessionStorage.setItem("user", JSON.stringify(data.user));

            navigate("/festi", { replace: true });
        } catch {
            setMsg("❌ Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 420 }}>
            <h1 className="mb-4 text-center">Fiesti</h1>
            {msg && <div className="alert alert-info text-center">{msg}</div>}

            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label htmlFor="inputEmail" className="form-label">Email</label>
                    <input
                        id="inputEmail"
                        type="email"
                        className="form-control"
                        placeholder="email@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="inputPassword" className="form-label">Contraseña</label>
                    <input
                        id="inputPassword"
                        type="password"
                        className="form-control"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
                    {loading ? "Entrando..." : "Iniciar sesión"}
                </button>

                <p className="mt-3 text-center mb-1">¿No tienes cuenta?</p>
                <div className="d-grid">
                    <Link
                        to="/signup"
                        className="btn"
                        style={{ backgroundColor: "#b26688", color: "#fff" }}
                    >
                        Crear cuenta
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;