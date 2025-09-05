import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import "../styles/festiactual.css";
import { Link } from "react-router-dom";
import { useTheme } from "../../ThemeContext";

const HORAS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
const ESCENARIOS = Array.from({ length: 5 }, (_, i) => `Escenario ${i + 1}`);
const BARRAS = Array.from({ length: 10 }, (_, i) => `Barra ${i + 1}`);

const splitHorario = (horario) => {
  if (!horario) return { inicio: "", fin: "" };
  const [inicio, fin] = horario.split("-").map((s) => s?.trim() || "");
  return { inicio, fin };
};

const getInicio = (horario) => {
  if (!horario || typeof horario !== "string") return "";
  const [ini] = horario.split("-").map(s => (s || "").trim());
  return ini || "";
};
const parseNum = (txt, prefix) => {
  if (!txt || typeof txt !== "string") return null;
  const r = new RegExp(`^${prefix}\\s*(\\d+)$`, "i");
  const m = txt.trim().match(r);
  return m ? parseInt(m[1], 10) : null;
};
const sortByHoraAsc = (a, b) => {
  const ia = getInicio(a.horario);
  const ib = getInicio(b.horario);
  if (!ia && !ib) return 0;
  if (!ia) return 1;
  if (!ib) return -1;
  return ia.localeCompare(ib);
};

const FestiActual = () => {
  const { user } = useAuth();
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [actuaciones, setActuaciones] = useState([]);
  const [msg, setMsg] = useState("");

  const isOrganizador = user?.role === "organizador";

  //  Cargar artistas/actuaciones desde backend
  useEffect(() => {
    const loadActs = async () => {
      try {
        const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/actuaciones");
        const data = await resp.json().catch(() => []);
        if (resp.ok && Array.isArray(data)) setActuaciones(data);
        else setActuaciones([]);
      } catch (e) {
        console.error("No se pudo cargar actuaciones del backend", e);
        setActuaciones([]);
      }
    };
    loadActs();
  }, []);

  //  Cargar empleados desde backend
  useEffect(() => {
    const loadPersonal = async () => {
      if (!user) {
        setEmpleados([]);
        return;
      }
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/users/personal", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setEmpleados([]);
          return;
        }
        const data = await res.json().catch(() => []);
        setEmpleados(Array.isArray(data) ? data : []);
      } catch {
        setEmpleados([]);
      }
    };
    loadPersonal();
  }, [user]);



  //filtro trabajadores y actuaciones
  const actsFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return actuaciones.slice();
    return actuaciones.filter(a => (a.name || "").toLowerCase().includes(q));
  }, [actuaciones, busqueda]);

  const persFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return empleados.slice();
    return empleados.filter(e => (e.name || "").toLowerCase().includes(q));
  }, [empleados, busqueda]);

  // emparejar Escenario con Barra y ordenando por hora
  const bloques = useMemo(() => {
    const actsByNum = new Map();
    for (const a of actsFiltradas) {
      const n = parseNum(a.escenario, "Escenario");
      if (!n) continue;
      if (!actsByNum.has(n)) actsByNum.set(n, []);
      actsByNum.get(n).push(a);
    }

    const empByNum = new Map();
    for (const e of persFiltrados) {
      const n = parseNum(e.puesto, "Barra");
      if (!n) continue;
      if (!empByNum.has(n)) empByNum.set(n, []);
      empByNum.get(n).push(e);
    }

    for (const arr of actsByNum.values()) arr.sort(sortByHoraAsc);
    for (const arr of empByNum.values()) arr.sort(sortByHoraAsc);

    const maxN = Math.max(
      0,
      ...[...actsByNum.keys(), ...empByNum.keys()].map(n => n || 0)
    );

    const out = [];
    for (let n = 1; n <= maxN; n++) {
      out.push({
        n,
        escenarioLabel: `Escenario ${n}`,
        barraLabel: `Barra ${n}`,
        acts: actsByNum.get(n) || [],
        pers: empByNum.get(n) || [],
      });
    }
    return out;
  }, [actsFiltradas, persFiltrados]);

  // acciones editar / limpiar (solo organizador)
  const guardarActuacion = async (id, escenario, inicio, fin) => {
    if (!isOrganizador) return;
    setMsg("");
    if (inicio && fin && fin <= inicio) {
      setMsg("⚠️ La hora de fin debe ser posterior a la de inicio.");
      return;
    }
    const payload = { escenario: escenario || null, horario: inicio && fin ? `${inicio}-${fin}` : "" };

    try {
      const token = sessionStorage.getItem("token");
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/actuaciones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMsg(data.msg || "❌ Error al guardar la asignación de la actuación");
        return;
      }
      const updated = data.actuacion ?? data;
      setActuaciones((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setMsg("✅ Asignación de actuación guardada");
      setTimeout(() => setMsg(""), 1500);
    } catch {
      setMsg("❌ Error de conexión");
    }
  };

  const limpiarActuacion = async (id) => {
    if (!isOrganizador) return;
    try {
      const token = sessionStorage.getItem("token");
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/actuaciones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ escenario: null, horario: "" }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMsg(data.msg || "❌ Error al limpiar la asignación de la actuación");
        return;
      }
      const updated = data.actuacion ?? data;
      setActuaciones((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setMsg("🧹 Asignación de actuación eliminada");
      setTimeout(() => setMsg(""), 1500);
    } catch {
      setMsg("❌ Error de conexión");
    }
  };

  const guardarPersonal = async (id, barra, inicio, fin) => {
    if (!isOrganizador) return;
    setMsg("");
    if (inicio && fin && fin <= inicio) { setMsg("⚠️ La hora de fin debe ser posterior a la de inicio."); return; }

    const payload = { puesto: barra || "", horario: inicio && fin ? `${inicio}-${fin}` : "" };
    try {
      const token = sessionStorage.getItem("token");
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/personal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) { setMsg(data.msg || "❌ Error al guardar la asignación del personal"); return; }
      // Actualiza en memoria
      setEmpleados(prev => prev.map(p =>
        p.id === id ? { ...p, puesto: payload.puesto, horario: payload.horario } : p
      ));
      setMsg("✅ Asignación de personal guardada");
      setTimeout(() => setMsg(""), 1500);
    } catch {
      setMsg("❌ Error de conexión");
    }
  };

  const limpiarPersonal = async (id) => {
    if (!isOrganizador) return;
    try {
      const token = sessionStorage.getItem("token");
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/personal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ puesto: "", horario: "" }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        setMsg(err.msg || "❌ Error al limpiar la asignación del personal");
        return;
      }
      setEmpleados((prev) =>
        prev.map((p) => (p.id === id ? { ...p, puesto: "", horario: "" } : p))
      );
      setMsg("🧹 Asignación de personal eliminada");
      setTimeout(() => setMsg(""), 1500);
    } catch {
      setMsg("❌ Error de conexión");
    }
  };

  const { darkMode } = useTheme();

  return (
    <div className="festi-container" style={{ maxWidth: 1200 }}>
      <h1 className="festi-title">Festival Actual</h1>

      {/* Buscador */}
      {msg && <div className="alert alert-info py-2">{msg}</div>}
      <div className="d-flex justify-content-end mb-3">
        <input
          className="form-control"
          style={{ maxWidth: 360 }}
          type="text"
          placeholder="Buscar actuación o empleado…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Bloques Escenario | Barra */}
      {bloques.length === 0 && (
        <div className="alert alert-secondary">
          No hay asignaciones aún. Asigna escenarios y barras para verlos emparejados.
        </div>
      )}

      {bloques.map(({ n, escenarioLabel, barraLabel, acts, pers }) => (
        <div className="card mb-4" key={n}>
          <div className="row g-0">
            {/* Columna Actuaciones */}
            <div className="col-12 col-lg-6 p-3 border-end">
              {/* Título clicable a Actuaciones */}
              <h6 className="fw-semibold mb-2">
                <Link to="/actuaciones" className="text-decoration-none">
                  {escenarioLabel}
                </Link>
              </h6>

              {acts.length === 0 ? (
                <div className="text-muted">No hay actuaciones asignadas a este escenario.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {acts.map((a) => {
                    const { inicio, fin } = splitHorario(a.horario);
                    return (
                      <li
                        className="list-group-item"
                        key={a.id}
                        style={{ background: "var(--bs-body-bg)" }}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div className="d-flex gap-3 align-items-center">
                            {a.photo && (
                              <img
                                src={a.photo}
                                alt={a.name}
                                style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 6 }}
                              />
                            )}
                            <div className="d-flex flex-column">
                              <strong>{a.name}</strong>
                              <small className="text-muted">
                                {(inicio || "--:--")} — {(fin || "--:--")}
                              </small>
                            </div>
                          </div>

                          {/* Editor inline (solo organizador) */}
                          {isOrganizador && (
                            <div style={{ minWidth: 260 }}>
                              <div className="row g-2">
                                <div className="col-12">
                                  <select
                                    id={`esc-${a.id}`}
                                    className="form-select form-select-sm"
                                    defaultValue={a.escenario || ""}
                                  >
                                    <option value="">Escenario…</option>
                                    {ESCENARIOS.map((e) => (
                                      <option key={e} value={e}>
                                        {e}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-6">
                                  <select
                                    id={`ai-${a.id}`}
                                    className="form-select form-select-sm"
                                    defaultValue={inicio || ""}
                                  >
                                    <option value="">Inicio</option>
                                    {HORAS.map((h) => (
                                      <option key={h} value={h}>
                                        {h}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-6">
                                  <select
                                    id={`af-${a.id}`}
                                    className="form-select form-select-sm"
                                    defaultValue={fin || ""}
                                  >
                                    <option value="">Fin</option>
                                    {HORAS.map((h) => (
                                      <option key={h} value={h}>
                                        {h}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-12 d-flex gap-2 justify-content-end">
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => limpiarActuacion(a.id)}
                                  >
                                    Quitar
                                  </button>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                      const esc = document.getElementById(`esc-${a.id}`).value;
                                      const ini = document.getElementById(`ai-${a.id}`).value;
                                      const finSel = document.getElementById(`af-${a.id}`).value;
                                      guardarActuacion(a.id, esc, ini, finSel);
                                    }}
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Columna Personal */}
            <div className="col-12 col-lg-6 p-3">
              {/* Título clicable a Personal */}
              <h6 className="fw-semibold mb-2">
                <Link to="/personal" className="text-decoration-none">
                  {barraLabel}
                </Link>
              </h6>

              {pers.length === 0 ? (
                <div className="text-muted">No hay personal asignado a esta barra.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {pers.map((e) => {
                    const { inicio, fin } = splitHorario(e.horario);
                    return (
                      <li className="list-group-item" key={e.id}>
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div className="d-flex flex-column">
                            <strong>{e.name}</strong>
                            <small className="text-muted">
                              {(inicio || "--:--")} — {(fin || "--:--")}
                            </small>
                          </div>

                          {/* Editor inline (solo organizador) */}
                          {isOrganizador && (
                            <div style={{ minWidth: 260 }}>
                              <div className="row g-2">
                                <div className="col-12">
                                  <select
                                    id={`pb-${e.id}`}
                                    className="form-select form-select-sm"
                                    defaultValue={e.puesto || ""}
                                  >
                                    <option value="">Barra…</option>
                                    {BARRAS.map((b) => (
                                      <option key={b} value={b}>
                                        {b}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-6">
                                  <select
                                    id={`pi-${e.id}`}
                                    className="form-select form-select-sm"
                                    defaultValue={inicio || ""}
                                  >
                                    <option value="">Inicio</option>
                                    {HORAS.map((h) => (
                                      <option key={h} value={h}>
                                        {h}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-6">
                                  <select
                                    id={`pf-${e.id}`}
                                    className="form-select form-select-sm"
                                    defaultValue={fin || ""}
                                  >
                                    <option value="">Fin</option>
                                    {HORAS.map((h) => (
                                      <option key={h} value={h}>
                                        {h}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-12 d-flex gap-2 justify-content-end">
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => limpiarPersonal(e.id)}
                                  >
                                    Quitar
                                  </button>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                      const barra = document.getElementById(`pb-${e.id}`).value;
                                      const ini = document.getElementById(`pi-${e.id}`).value;
                                      const finSel = document.getElementById(`pf-${e.id}`).value;
                                      guardarPersonal(e.id, barra, ini, finSel);
                                    }}
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FestiActual;
