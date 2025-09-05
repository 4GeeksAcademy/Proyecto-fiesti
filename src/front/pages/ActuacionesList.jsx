import React, { useEffect, useState } from "react";
import CrearActuacion from "./CrearActuacion";
import "../styles/actuacioneslist.css"

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
            const token = sessionStorage.getItem("token");
            const resp = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/actuaciones/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
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

    // Helpers para horario "HH:MM-HH:MM"
    const splitHorario = (horario) => {
        if (!horario) return { inicio: "", fin: "" };
        const [inicio, fin] = horario.split("-").map((s) => s?.trim() || "");
        return { inicio: inicio || "", fin: fin || "" };
    };
    const getInicio = (horario) => splitHorario(horario).inicio;

    const guardarAsignacion = async (id, escenario, inicio, fin) => {
        setMsg("");
        if (inicio && fin && fin <= inicio) {
            setMsg("⚠️ La hora de fin debe ser posterior a la de inicio.");
            return;
        }
        const payload = { escenario, horario: inicio && fin ? `${inicio}-${fin}` : "" };

        try {
            const token = sessionStorage.getItem("token");
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/actuaciones/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            const data = await resp.json();
            if (!resp.ok) {
                setMsg(data.msg || "❌ Error al guardar la asignación");
                return;
            }
            const updated = data.actuacion ?? data;
            setActuaciones((prev) => prev.map((a) => (a.id === id ? updated : a)));
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
            const token = sessionStorage.getItem("token");
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/actuaciones/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ escenario: null, horario: "" }),
            });
            const data = await resp.json();
            if (!resp.ok) {
                setMsg(data.msg || "❌ Error al limpiar la asignación");
                return;
            }
            const updated = data.actuacion ?? data;
            setActuaciones((prev) => prev.map((a) => (a.id === id ? updated : a)));
            setMsg("🧹 Asignación eliminada");
            setTimeout(() => setMsg(""), 1500);
        } catch (err) {
            console.error(err);
            setMsg("❌ Error de conexión");
        }
    };

    const isAssigned = (a) => !!(a?.escenario || a?.horario);

    // Filtrado por texto
    const listFiltrada = actuaciones.filter((a) =>
        (a.name || "").toLowerCase().includes(busqueda.toLowerCase())
    );

    // Columnas
    const noAsignadas = listFiltrada.filter((a) => !isAssigned(a));

    // agrupar asignadas por escenario y ordenar por inicio de 'horario'
    const asignadas = listFiltrada.filter(isAssigned);
    const gruposEscenario = asignadas.reduce((acc, a) => {
        const key = a.escenario || "Sin escenario";
        (acc[key] ||= []).push(a);
        return acc;
    }, {});

    Object.keys(gruposEscenario).forEach((key) => {
        gruposEscenario[key].sort((a, b) => {
            const ia = getInicio(a.horario);
            const ib = getInicio(b.horario);
            if (!ia) return 1;
            if (!ib) return -1;
            return ia.localeCompare(ib);
        });
    });

    const ActItem = ({ a }) => {
        const splitHorario = (horario) => {
            if (!horario) return { inicio: "", fin: "" };
            const [inicio, fin] = horario.split("-").map(s => s?.trim() || "");
            return { inicio, fin };
        };
        const { inicio, fin } = splitHorario(a.horario);
        const isAssigned = (x) => !!(x?.escenario || x?.horario);

        return (
            <li className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>{a.name}</strong>{" "}
                        {isAssigned(a) ? (
                            <span className="ms-2">
                                <span className="badge badge-escenario me-2">
                                    {a.escenario || "Sin escenario"}
                                </span>
                                <span className="badge badge-horario">
                                    {(inicio || "--:--")} – {(fin || "--:--")}
                                </span>
                            </span>
                        ) : (
                            <span className="text-muted">Sin asignación</span>
                        )}
                    </div>

                    <div className="d-flex gap-2">
                        {isAssigned(a) && (
                            <button
                                className="btn btn-borrar-rojo btn-sm"
                                onClick={() => limpiarAsignacion(a.id)}
                            >
                                Quitar asignación
                            </button>
                        )}
                        <button
                            className="btn btn-outline-rojo btn-sm"
                            onClick={() => handleDelete(a.id)}
                        >
                            Eliminar
                        </button>
                        <button
                            className="btn btn-rojo btn-sm"
                            onClick={() => toggleEditor(a.id)}
                        >
                            {abierta === a.id ? "Cerrar" : "Asignar"}
                        </button>
                    </div>
                </div>

                {abierta === a.id && (
                    <div className="mt-3 rounded p-3 editor">
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
                                <select
                                    id={`inicio-${a.id}`}
                                    className="form-select"
                                    defaultValue={inicio || ""}
                                >
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
                                <select
                                    id={`fin-${a.id}`}
                                    className="form-select"
                                    defaultValue={fin || ""}
                                >
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
                                    className="btn btn-rojo"
                                    onClick={() => {
                                        const escenario = document.getElementById(`escenario-${a.id}`).value;
                                        const inicioSel = document.getElementById(`inicio-${a.id}`).value;
                                        const finSel = document.getElementById(`fin-${a.id}`).value;
                                        guardarAsignacion(a.id, escenario, inicioSel, finSel);
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
    };

    return (
        <div className="container mt-4 actuaciones-container" style={{ maxWidth: 1200 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Actuaciones</h2>
                <button className="btn btn-rojo" onClick={() => setMostrarForm((v) => !v)}>
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
                        <div className="card-header">
                            <strong>No asignadas</strong>{" "}
                            {noAsignadas.length > 0 && <span className="text-white-50">({noAsignadas.length})</span>}
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

                {/* Asignadas */}
                <div className="col-12 col-lg-6">
                    <div className="card h-100">
                        <div className="card-header">
                            <strong>Asignadas</strong>{" "}
                            {asignadas.length > 0 && <span className="text-white-50">({asignadas.length})</span>}
                        </div>
                        <div className="list-group list-group-flush">
                            {Object.keys(gruposEscenario).length === 0 ? (
                                <li className="list-group-item text-muted">No hay actuaciones asignadas</li>
                            ) : (
                                Object.keys(gruposEscenario)
                                    .sort((a, b) => a.localeCompare(b))
                                    .map((esc) => (
                                        <div key={esc} className="border-top">
                                            <div className="px-3 py-2 bg-white fw-semibold">{esc}</div>
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