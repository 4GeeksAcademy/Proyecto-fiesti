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
            });
            const data = await resp.json();
            if (!resp.ok) {
                setMsg(data.msg || "❌ Error al eliminar");
                return;
            }
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

    const guardarAsignacion = async (id, escenario, inicio, fin) => {
        setMsg("");
        if (inicio && fin && fin <= inicio) {
            setMsg("⚠️ La hora de fin debe ser posterior a la de inicio.");
            return;
        }
        try {
            const resp = await fetch(
                import.meta.env.VITE_BACKEND_URL + `/api/actuaciones/${id}/asignacion`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ escenario, horaInicio: inicio, horaFin: fin }),
                }
            );
            const data = await resp.json();
            if (!resp.ok) {
                setMsg(data.msg || "❌ Error al guardar la asignación");
                return;
            }
            setActuaciones((prev) => prev.map((a) => (a.id === id ? data.actuacion : a)));
            setAbierta(null);
            setMsg("✅ Asignación guardada");
            setTimeout(() => setMsg(""), 1500);
        } catch (err) {
            console.error(err);
            setMsg("❌ Error de conexión");
        }
    };

    const limpiarAsignacion = async (id) => {
        try {
            const resp = await fetch(
                import.meta.env.VITE_BACKEND_URL + `/api/actuaciones/${id}/asignacion`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ escenario: null, horaInicio: null, horaFin: null }),
                }
            );
            const data = await resp.json();
            if (!resp.ok) {
                setMsg(data.msg || "❌ Error al limpiar la asignación");
                return;
            }
            setActuaciones((prev) => prev.map((a) => (a.id === id ? data.actuacion : a)));
            setMsg("🧹 Asignación eliminada");
            setTimeout(() => setMsg(""), 1500);
        } catch (err) {
            console.error(err);
            setMsg("❌ Error de conexión");
        }
    };

    const isAssigned = (a) => !!(a.escenario || a.horaInicio || a.horaFin);

    // Filtrado por texto
    const listFiltrada = actuaciones.filter((a) =>
        (a.name || "").toLowerCase().includes(busqueda.toLowerCase())
    );

    // Columnas
    const noAsignadas = listFiltrada.filter((a) => !isAssigned(a));

    // agrupar asignadas por escenario y ordenar por horaInicio
    const asignadas = listFiltrada.filter(isAssigned);
    const gruposEscenario = asignadas.reduce((acc, a) => {
        const key = a.escenario || "Sin escenario";
        (acc[key] ||= []).push(a);
        return acc;
    }, {});

    Object.keys(gruposEscenario).forEach((key) => {
        gruposEscenario[key].sort((a, b) => {
            if (!a.horaInicio) return 1;
            if (!b.horaInicio) return -1;
            return a.horaInicio.localeCompare(b.horaInicio);
        });
    });

    const ActItem = ({ a }) => (
        <li className="list-group-item">
            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <strong>{a.name}</strong>{" "}
                    {isAssigned(a) ? (
                        <span className="ms-2">
                            <span className="badge text-bg-primary me-2">
                                {a.escenario || "Sin escenario"}
                            </span>
                            <span className="badge text-bg-secondary">
                                {a.horaInicio || "--:--"} – {a.horaFin || "--:--"}
                            </span>
                        </span>
                    ) : (
                        a.hour ? <span className="text-muted">({a.hour})</span> : <span className="text-muted">Sin asignación</span>
                    )}
                </div>

                <div className="d-flex gap-2">
                    {isAssigned(a) && (
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => limpiarAsignacion(a.id)}
                        >
                            Quitar asignación
                        </button>
                    )}
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
    );

    return (
        <div className="container mt-4" style={{ maxWidth: 1200 }}>
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
                            setActuaciones((prev) => [...prev, nueva]);
                            setMostrarForm(false);
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
                className="form-control mb-4"
                placeholder="Buscar actuación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="row g-4">
                {/* No asignadas */}
                <div className="col-12 col-lg-6">
                    <div className="card h-100">
                        <div className="card-header bg-light">
                            <strong>No asignadas</strong> {noAsignadas.length > 0 && <span className="text-muted">({noAsignadas.length})</span>}
                        </div>
                        <ul className="list-group list-group-flush">
                            {noAsignadas.length === 0 ? (
                                <li className="list-group-item text-muted">No hay actuaciones sin asignación</li>
                            ) : (
                                noAsignadas.map((a) => <ActItem key={a.id} a={a} />)
                            )}
                        </ul>
                    </div>
                </div>

                {/* Asignadas agrupadas por escenario */}
                <div className="col-12 col-lg-6">
                    <div className="card h-100">
                        <div className="card-header bg-light">
                            <strong>Asignadas</strong> {asignadas.length > 0 && <span className="text-muted">({asignadas.length})</span>}
                        </div>

                        {/* Grupos por escenario */}
                        <div className="list-group list-group-flush">
                            {Object.keys(gruposEscenario).length === 0 ? (
                                <li className="list-group-item text-muted">No hay actuaciones asignadas</li>
                            ) : (
                                Object.keys(gruposEscenario)
                                    .sort((a, b) => a.localeCompare(b)) // orden alfabético de escenarios
                                    .map((esc) => (
                                        <div key={esc} className="border-top">
                                            <div className="px-3 py-2 bg-white fw-semibold">
                                                {esc}
                                            </div>
                                            <ul className="list-group list-group-flush">
                                                {gruposEscenario[esc].map((a) => (
                                                    <ActItem key={a.id} a={a} />
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}