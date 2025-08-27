import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate=useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await resp.json();
            if (resp.ok) {
                setMessage("✅ Sesión iniciada");
                sessionStorage.setItem("token", data.access_token);
                navigate("/festi");
            } else {
                setMessage(data.msg || "❌ Error al iniciar sesión");
            }
        } catch (err) {
            setMessage("❌ Error de conexión con el servidor");
        }
    };

    return (
        <div className="container mt-5 text-center" style={{ maxWidth: "400px" }}>
            <h1 className="mb-4">Fiesti</h1>
            {message && <p>{message}</p>}

            <form onSubmit={handleLogin} className="loginForm">
                {/* Email */}
                <div className="mb-3">
                    <label htmlFor="inputEmail" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="inputEmail"
                        placeholder="email@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password */}
                <div className="mb-3">
                    <label htmlFor="inputPassword" className="form-label">Contraseña</label>
                    <input
                        type="password"
                        id="inputPassword"
                        className="form-control"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div id="passwordHelpBlock" className="form-text mt-1">
                        La contraseña debe tener entre 6 y 20 caracteres e incluir como mínimo una letra mayúscula,
                        una letra minúscula y un número. Puedes añadir símbolos y espacios, pero no emojis.
                    </div>
                </div>

                {/* Botón Login */}
                <button type="submit" className="btn btn-primary w-100 mt-3">
                    Iniciar sesión
                </button>

                {/* Google Login */}
                <p className="mt-3">Inicia sesión de forma rápida con tu cuenta de Google</p>
                <button type="button" className="btn btn-secondary w-100">
                    Google
                </button>

                {/* Links */}
                <div className="mt-3">
                    <a href="#">¿Has olvidado tu contraseña?</a>
                    <span className="ms-2">
                        <a href="/signup">Crear cuenta</a>
                    </span>
                </div>
            </form>
        </div>
    );
};

export default Login;