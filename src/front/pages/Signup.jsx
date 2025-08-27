import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "personal", // valor por defecto: personal
        photo: "",
        puesto: "",
        card_number: "",
        card_cvc: "",
        card_expiration: "",
        card_holder: ""
    });

    const [message, setMessage] = useState("");
    const navigate=useNavigate();
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await resp.json();
            if (resp.ok) {
                setMessage("✅ Registro exitoso");
                navigate("/login");
            } else {
                setMessage(data.msg || "❌ Error en el registro");
            }
        } catch (error) {
            setMessage("❌ Error de conexión con el servidor");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Registro</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    className="form-control mb-3"
                    onChange={handleChange}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="form-control mb-3"
                    onChange={handleChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    className="form-control mb-3"
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Teléfono"
                    className="form-control mb-3"
                    onChange={handleChange}
                />

                {/* Selector de rol */}
                <select
                    name="role"
                    className="form-select mb-3"
                    value={formData.role}
                    onChange={handleChange}
                >
                    <option value="personal">Personal</option>
                    <option value="organizador">Organizador</option>
                </select>

                {formData.role === "personal" && (
                    <select name="puesto" className="form-select mb-3" onChange={handleChange}>
                        <option value="">Selecciona puesto</option>
                        <option value="barra">Barra</option>
                    </select>
                )}

                {formData.role === "organizador" && (
                    <div>
                        <input type="text" name="card_number" placeholder="Número de tarjeta"
                            className="form-control mb-3" onChange={handleChange} />
                        <input type="text" name="card_cvc" placeholder="CVC"
                            className="form-control mb-3" onChange={handleChange} />
                        <input type="text" name="card_expiration" placeholder="MM/AAAA"
                            className="form-control mb-3" onChange={handleChange} />
                        <input type="text" name="card_holder" placeholder="Titular de la tarjeta"
                            className="form-control mb-3" onChange={handleChange} />
                    </div>
                )}

                <button type="submit" className="btn btn-primary">
                    Registrarse
                </button>
            </form>
        </div>
    );
};

export default Signup;