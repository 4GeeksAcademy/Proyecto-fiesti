import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";
import Logo from "../assets/img/Logo.png";
import LogoDark from "../assets/img/LogoDark.png";
import "../index.css";


const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    const isDarkMode = localStorage.getItem("theme") === "dark"; // Para que el logo cambie con el modo noche

    return (
        <div className="container mt-5" style={{ maxWidth: 420 }}>
            <img src={isDarkMode ? LogoDark : Logo} alt="Logo Fiesti" className="logo mb-4" />
            <h1 className="mb-4 text-center">Iniciar sesión</h1>
            {msg && <div className="alert text-center">{msg}</div>}

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

                <div className="password mb-3">
                    <label htmlFor="inputPassword" className="form-label">Contraseña</label>
                    <input
                        id="inputPassword"
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        style={{ paddingRight: "2.5rem" }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="password-toggle-btn"
                        tabIndex={-1}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye-fill"}`}></i>
                    </button>
                </div>

                {/* Inicio sesión */}
                <button type="submit" className="btn-login w-100 mt-2" disabled={loading}>
                    {loading ? "Entrando..." : <b>Iniciar sesión</b>}
                </button>

                {/* Google Login */}
                {/* <p className="mt-3 text-center">Inicia sesión de forma rápida con tu cuenta de Google</p>
                <button type="button" className="btn-google w-100">
                    <i className="fa-brands fa-google me-2"></i><b>Google</b>
                </button> */}

                {/* Links */}
                <div className="links mt-3">
                    <Link to="#" className="forget" ><b>¿Has olvidado tu contraseña?</b></Link>
                    <span className="signup ms-2">
                        <Link to="/signup" className="signup"><b>Crear cuenta</b></Link>
                    </span>
                </div>
            </form >
        </div >
    );
};

export default Login;