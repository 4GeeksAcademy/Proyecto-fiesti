import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CrearActuacion = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        description: "",
        photo: "",
        hour: "", // HTML time -> "HH:MM"
    });
    const [msg, setMsg] = useState("");

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg("");

        // ✅ Modo local (sin backend todavía)
        if (typeof onSave === "function") {
            onSave({
                name: form.name.trim(),
                description: form.description.trim(),
                photo: form.photo.trim() || null,
                hour: form.hour || null,
            });
            setForm({ name: "", description: "", photo: "", hour: "" });
            setMsg("✅ Actuación añadida (local)");
            return; 
        }

        // (Dejo esto para  el backend)
        try {
            const resp = await apiFetch("/api/actuaciones", {
                method: "POST",
                body: JSON.stringify(form),
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                setMsg(data.msg || `Error (HTTP ${resp.status})`);
                return;
            }
            setMsg("✅ Actuación creada en servidor");
            setForm({ name: "", description: "", photo: "", hour: "" });
        } catch (err) {
            console.error(err);
            setMsg("❌ Error de conexión");
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: 640 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Nueva actuación</h3>
            </div>

            {msg && <div className="alert alert-info">{msg}</div>}

            <form onSubmit={onSubmit}>
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

                <div className="row g-3 mb-3">
                    <div className="col-6">
                        <label className="form-label">Hora (21:30)</label>
                        <input
                            className="form-control"
                            type="text"
                            name="hour"
                            value={form.hour}
                            onChange={onChange}
                        />
                    </div>
                </div>

                <button className="btn btn-primary">Guardar actuación</button>
            </form>
        </div>
    );
};

export default CrearActuacion;