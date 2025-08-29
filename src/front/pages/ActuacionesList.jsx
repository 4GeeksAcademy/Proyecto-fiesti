import React, { useEffect, useState } from "react";
import CrearActuacion from "./CrearActuacion";

export default function ActuacionesList() {
    const [actuaciones, setActuaciones] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [abierta, setAbierta] = useState(null);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/actuaciones");
                const data = await resp.json();
                if (resp.ok) setActuaciones(data);
            } catch (e) {
                console.error("No se pudo cargar actuaciones del backend", e);
            }
        };
        load();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta actuación?")) return;

        try {
            const resp = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/actuaciones/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                // 👇 más adelante aquí se pone Authorization: Bearer token
            });

            const data = await resp.json();
            if (!resp.ok) {
                setMsg(data.msg || "❌ Error al eliminar");
                return;
            }

            // Eliminar del estado
            setActuaciones((prev) => prev.filter((a) => a.id !== id));
            setMsg("🗑️ Actuación eliminada");
            setTimeout(() => setMsg(""), 2000);
        } catch (err) {
            console.error(err);
            setMsg("❌ Error de conexión");
        }
    };

    const ESCENARIOS = ["Escenario 1", "Escenario 2", "Escenario 3", "Escenario 4", "Escenario 5"];
    const HORAS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

    const toggleEditor = (id) => {
        setMsg("");
        setAbierta((prev) => (prev === id ? null : id));
    };

    const guardarAsignacion = (id, escenario, inicio, fin) => {
        setMsg("");
        if (inicio && fin && fin <= inicio) {
            setMsg("⚠️ La hora de fin debe ser posterior a la de inicio.");
            return;
        }
        setActuaciones((prev) =>
            prev.map((a) =>
                a.id === id ? { ...a, escenario: escenario || null, horaInicio: inicio || null, horaFin: fin || null } : a
            )
        );
        setAbierta(null);
        setMsg("✅ Asignación guardada (solo front de momento)");
        setTimeout(() => setMsg(""), 1500);
    };

    const limpiarAsignacion = (id) => {
        setActuaciones((prev) =>
            prev.map((a) => (a.id === id ? { ...a, escenario: null, horaInicio: null, horaFin: null } : a))
        );
        setMsg("🧹 Asignación eliminada");
        setTimeout(() => setMsg(""), 1500);
    };

    const filtradas = actuaciones.filter((a) =>
        (a.name || "").toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="container mt-4" style={{ maxWidth: 900 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Actuaciones</h2>
                <button className="btn btn-primary" onClick={() => setMostrarForm((v) => !v)}>
                    {mostrarForm ? "Cancelar" : "➕ Nueva actuación"}
                </button>
            </div>

            {mostrarForm && (
                <div className="card card-body mb-4">
                    <CrearActuacion
                        onCreated={(nueva) => {
                            // nueva viene del backend: { id, name, description, hour, ... } ya serializada
                            setActuaciones((prev) => [...prev, nueva]);
                            setMsg("✅ Actuación creada");
                            setTimeout(() => setMsg(""), 1500);
                        }}
                        onCancel={() => setMostrarForm(false)}
                    />
                </div>
            )}

            {msg && <div className="alert alert-info">{msg}</div>}

            <input
                type="text"
                className="form-control mb-3"
                placeholder="Buscar actuación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
            />

            {filtradas.length === 0 ? (
                <div className="alert alert-secondary">No hay actuaciones que coincidan.</div>
            ) : (
                <ul className="list-group">
                    {filtradas.map((a) => (
                        <li key={a.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <strong>{a.name}</strong>{" "}
                                    {a.hour && <span className="text-muted">({a.hour})</span>}
                                </div>

                                <div className="d-flex gap-2">
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(a.id)}>
                                        Eliminar
                                    </button>
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => toggleEditor(a.id)}>
                                        {abierta === a.id ? "Cerrar" : "Asignar"}
                                    </button>
                                </div>
                            </div>


                            {abierta === a.id && (
                                <div className="mt-3 border rounded p-3 bg-light">
                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-4">
                                            <label className="form-label">Escenario</label>
                                            <select id={`escenario-${a.id}`} className="form-select" defaultValue={a.escenario || ""}>
                                                <option value="">Selecciona escenario</option>
                                                {ESCENARIOS.map((esc) => (
                                                    <option key={esc} value={esc}>{esc}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">Inicio</label>
                                            <select id={`inicio-${a.id}`} className="form-select" defaultValue={a.horaInicio || ""}>
                                                <option value="">--:--</option>
                                                {HORAS.map((h) => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">Fin</label>
                                            <select id={`fin-${a.id}`} className="form-select" defaultValue={a.horaFin || ""}>
                                                <option value="">--:--</option>
                                                {HORAS.map((h) => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-2 d-grid">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => {
                                                    const escenario = document.getElementById(`escenario-${a.id}`).value;
                                                    const inicio = document.getElementById(`inicio-${a.id}`).value;
                                                    const fin = document.getElementById(`fin-${a.id}`).value;
                                                    guardarAsignacion(a.id, escenario, inicio, fin);
                                                }}
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}