import React, { useState } from "react";
import { useTheme } from "../../ThemeContext";

const CrearActuacion = ({ onCreated, onCancel }) => {
    const [form, setForm] = useState({
        name: "",
        description: "",
        photo: "",
        horario: "", // "HH:MM" opcional
    });
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        setLoading(true);

        try {
            const token = sessionStorage.getItem("token");
            const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/actuaciones", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}) // ← JWT
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description.trim(),
                    photo: form.photo.trim() || null,
                    // Envío horario solo si hay algo escrito; el backend valida "HH:MM-HH:MM"
                    ...(form.horario.trim() ? { horario: form.horario.trim() } : {})
                }),
            });

            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                setMsg(data.msg || `Error (HTTP ${resp.status})`);
                setLoading(false);
                return;
            }

            setMsg("✅ Actuación creada");
            // Avisamos al padre con la actuación creada que devuelve el backend
            if (typeof onCreated === "function") onCreated(data.actuacion);

            // Limpia y cierra
            setForm({ name: "", description: "", photo: "", horario: "" });
            setLoading(false);
            if (typeof onCancel === "function") onCancel();
        } catch (err) {
            console.error(err);
            setMsg("❌ Error de conexión");
            setLoading(false);
        }
    };

    const { darkMode } = useTheme();

    return (
        <form onSubmit={onSubmit}>
            {msg && <div className="alert alert-info">{msg}</div>}

            <input
                className="form-control mb-3"
                type="text"
                name="name"
                placeholder="Nombre del artista/actuación"
                value={form.name}
                onChange={onChange}
                required
            />

            <textarea
                className="form-control mb-3"
                name="description"
                placeholder="Descripción"
                rows="3"
                value={form.description}
                onChange={onChange}
                required
            />

            <input
                className="form-control mb-3"
                type="url"
                name="photo"
                placeholder="URL de imagen (opcional)"
                value={form.photo}
                onChange={onChange}
            />

            <div className="mb-3">
                <label className="form-label">Hora que prefiere actuar (opcional, formato 21:30)</label>
                <input
                    className="form-control"
                    type="text"
                    name="hour"
                    value={form.horario}
                    onChange={onChange}
                    placeholder="HH:MM"
                />
            </div>

            <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </button>
                <button className="btn btn-primary" disabled={loading}>
                    {loading ? "Guardando..." : "Guardar actuación"}
                </button>
            </div>
        </form>
    );
};

export default CrearActuacion;