import React, { useState } from "react";
import { useTheme } from "../../ThemeContext";

const CrearActuacion = ({ onCreated, onCancel }) => {
    const [form, setForm] = useState({
        name: "",
        description: "",
        photo: "",
        num_personas: "",
        cache: "",
        peticiones: "",
    });
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        setLoading(true);

        try {
            // Validación mínima en cliente
            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                photo: form.photo.trim() || null,
                // si se han informado, los convertimos correctamente
                ...(form.num_personas !== "" ? { num_personas: parseInt(form.num_personas, 10) } : {}),
                ...(form.cache !== "" ? { cache: parseFloat(form.cache) } : {}),
                ...(form.peticiones.trim() ? { peticiones: form.peticiones.trim() } : {}),
            };

            const token = sessionStorage.getItem("token");
            const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/actuaciones", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
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
            setForm({ name: "", description: "", photo: "", num_personas: "", cache: "", peticiones: "", });
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

            <div className="row g-3 mb-3">
                <div className="col-md-4">
                    <label className="form-label">Nº de personas</label>
                    <input
                        className="form-control"
                        type="number"
                        name="num_personas"
                        min="1"
                        step="1"
                        placeholder="Ej. 4"
                        value={form.num_personas}
                        onChange={onChange}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Caché (€)</label>
                    <input
                        className="form-control"
                        type="number"
                        name="cache"
                        min="0"
                        step="0.01"
                        placeholder="Ej. 1500.00"
                        value={form.cache}
                        onChange={onChange}
                    />
                </div>

                <div className="col-12">
                    <label className="form-label">Peticiones de la actuación (rider)</label>
                    <textarea
                        className="form-control"
                        name="peticiones"
                        rows="3"
                        placeholder="Backline, bebidas, camerino, etc."
                        value={form.peticiones}
                        onChange={onChange}
                    />
                </div>
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