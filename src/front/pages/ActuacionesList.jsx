import React, { useEffect, useState } from "react";
import CrearActuacion from "./CrearActuacion";

export default function ActuacionesList() {
    const [actuaciones, setActuaciones] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [abierta, setAbierta] = useState(null);   // id de la actuación con editor abierto
    const [msg, setMsg] = useState("");

    // Cargar desde localStorage
    useEffect(() => {
        const guardadas = localStorage.getItem("actuaciones");
        if (guardadas) setActuaciones(JSON.parse(guardadas));
    }, []);

    // Guardar en localStorage al cambiar
    useEffect(() => {
        localStorage.setItem("actuaciones", JSON.stringify(actuaciones));
    }, [actuaciones]);

    // Añadir nueva actuación (recibe el objeto del hijo CrearActuacion)
    const handleSaveNueva = (nueva) => {
        const withId = { ...nueva, id: Date.now(), escenario: null, horaInicio: null, horaFin: null };
        setActuaciones((prev) => [...prev, withId]);
        setMostrarForm(false);
        setMsg("✅ Actuación creada (local)");
        setTimeout(() => setMsg(""), 1500);
    };

    
    const ESCENARIOS = ["Escenario 1", "Escenario 2", "Escenario 3", "Escenario 4", "Escenario 5"];
    const HORAS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

    // Editor desplegable
    const toggleEditor = (id) => {
        setMsg("");
        setAbierta((prev) => (prev === id ? null : id));
    };

    // Guardar asignación (escenario + horas) en la actuación
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
        setMsg("✅ Asignación guardada");
        setTimeout(() => setMsg(""), 1500);
    };

    // Quitar asignación
    const limpiarAsignacion = (id) => {
        setMsg("");
        setActuaciones((prev) =>
            prev.map((a) => (a.id === id ? { ...a, escenario: null, horaInicio: null, horaFin: null } : a))
        );
        setMsg("🧹 Asignación eliminada");
        setTimeout(() => setMsg(""), 1500);
    };

    // Filtro por nombre
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
                    {/* onSave para modo local (sin backend) */}
                    <CrearActuacion onSave={handleSaveNueva} />
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
                            {/* cabecera de la actuación */}
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <strong>{a.name}</strong>{" "}
                                    {a.hour && <span className="text-muted">({a.hour})</span>}
                                    {a.escenario || a.horaInicio || a.horaFin ? (
                                        <div className="mt-1">
                                            <span className="badge text-bg-primary me-2">
                                                {a.escenario || "Sin escenario"}
                                            </span>
                                            <span className="badge text-bg-secondary">
                                                {a.horaInicio || "--:--"} – {a.horaFin || "--:--"}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mt-1 text-muted">Sin asignación</div>
                                    )}
                                </div>

                                <div className="d-flex gap-2">
                                    {(a.escenario || a.horaInicio || a.horaFin) && (
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => limpiarAsignacion(a.id)}>
                                            Quitar asignación
                                        </button>
                                    )}
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => toggleEditor(a.id)}>
                                        {abierta === a.id ? "Cerrar" : "Asignar"}
                                    </button>
                                </div>
                            </div>

                            {/* editor desplegable para esa actuación */}
                            {abierta === a.id && (
                                <div className="mt-3 border rounded p-3 bg-light">
                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-4">
                                            <label className="form-label">Escenario</label>
                                            <select
                                                id={`escenario-${a.id}`}
                                                className="form-select"
                                                defaultValue={a.escenario || ""}
                                            >
                                                <option value="">Selecciona escenario</option>
                                                {ESCENARIOS.map((esc) => (
                                                    <option key={esc} value={esc}>
                                                        {esc}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">Inicio</label>
                                            <select id={`inicio-${a.id}`} className="form-select" defaultValue={a.horaInicio || ""}>
                                                <option value="">--:--</option>
                                                {HORAS.map((h) => (
                                                    <option key={h} value={h}>
                                                        {h}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">Fin</label>
                                            <select id={`fin-${a.id}`} className="form-select" defaultValue={a.horaFin || ""}>
                                                <option value="">--:--</option>
                                                {HORAS.map((h) => (
                                                    <option key={h} value={h}>
                                                        {h}
                                                    </option>
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