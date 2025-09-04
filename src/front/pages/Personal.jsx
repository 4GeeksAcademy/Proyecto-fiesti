import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/personallist.css";


export default function Personal() {
    const [empleados, setEmpleados] = useState([]);
    const [activo, setActivo] = useState(null);
    const [busqueda, setBusqueda] = useState("");


    //  Cargar empleados desde backend y actualizados
    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "/api/users/personal")
            .then((res) => res.json())
            .then((data) => {
                const empleadosConAsignado = data.map(emp => ({
                    ...emp,
                    asignado: emp.puesto && emp.horario ? true : false,
                }));
                setEmpleados(empleadosConAsignado);
            })
            .catch((err) => console.error("Error cargando empleados:", err));
    }, []);


    //   Toggle desplegable
    const toggleEmpleado = (id) => {
        setActivo(activo === id ? null : id);
    };

    //   Guardar asignación con FETCH
    const guardarAsignacion = async (id, puesto, horario) => {
        const userData = { puesto, horario };
        const token = sessionStorage.getItem("token");

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        if (token) {
            myHeaders.append("Authorization", `Bearer ${token}`);
        }

        try {
            const response = await fetch(
                import.meta.env.VITE_BACKEND_URL + `/api/users/personal/${id}`,
                {
                    method: "PUT",
                    headers: myHeaders,
                    body: JSON.stringify(userData),
                }
            );

            if (!response.ok) {
                throw new Error("Error al guardar la asignación.");
            }

            const data = await response.json();
            console.log("Asignación guardada con éxito:", data);

            setEmpleados(
                empleados.map((e) =>
                    e.id === id ? { ...e, puesto, horario, asignado: true } : e
                )
            );
            setActivo(null);
        } catch (error) {
            console.error("Hubo un problema al guardar la asignación:", error);
        }
    };

    //   Borrar asignación con FETCH
    const borrarAsignacion = async (id) => {
        const userData = { puesto: "", horario: "" };
        const token = sessionStorage.getItem("token");

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        if (token) {
            myHeaders.append("Authorization", `Bearer ${token}`);
        }

        try {
            const response = await fetch(
                import.meta.env.VITE_BACKEND_URL + `/api/users/personal/${id}`,
                {
                    method: "PUT",
                    headers: myHeaders,
                    body: JSON.stringify(userData),
                }
            );

            if (!response.ok) {
                throw new Error("Error al borrar la asignación.");
            }

            setEmpleados(
                empleados.map((e) =>
                    e.id === id ? { ...e, puesto: "", horario: "", asignado: false } : e
                )
            );
        } catch (error) {
            console.error("Hubo un problema al borrar la asignación:", error);
        }
    };


    // Filtrado por búsqueda
    const empleadosFiltrados = empleados.filter((emp) =>
        emp?.name?.toLowerCase().includes(busqueda.toLowerCase())
    );

    // asignación
    const isAsignado = (emp) =>
        !!(emp?.asignado || (emp?.puesto && emp?.horario && emp.horario.includes("-")));

    // Columnas
    const noAsignados = empleadosFiltrados.filter((e) => !isAsignado(e));
    const asignados = empleadosFiltrados
        .filter(isAsignado)
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    // Agrupar izquierda (no asignados) por inicial
    const gruposNoAsignados = noAsignados.reduce((acc, emp) => {
        if (!emp?.name) return acc;
        const letra = emp.name[0].toUpperCase();
        if (!acc[letra]) acc[letra] = [];
        acc[letra].push(emp);
        return acc;
    }, {});

    // Agrupar derecha (asignados) por barra/puesto
    const gruposPorBarra = asignados.reduce((acc, emp) => {
        const key = emp.puesto || "Sin barra";
        (acc[key] ||= []).push(emp);
        return acc;
    }, {});

    return (
        <div className="personal-container mt-4" style={{ maxWidth: 1200}}>
            <h2>Personal</h2>

            {/* Buscador */}
            <input
                className="form-control mb-4"
                type="text"
                placeholder="Buscar empleado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="row g-4">
                {/* columna izquierda como se mostraba antes en una sola columna */}
                <div className="col-12 col-lg-6">
                    <div className="card h-100">
                        <div className="card-header bg-light">
                            <strong>No asignados</strong>{" "}
                            {noAsignados.length > 0 && (
                                <span className="text-muted">({noAsignados.length})</span>
                            )}
                        </div>
                        <div className="card-body">
                            {/* Lista de empleados */}
                            {Object.keys(gruposNoAsignados)
                                .sort()
                                .map((letra) => (
                                    <div key={letra}>
                                        <div className="grupo-header">{letra}</div>
                                        {gruposNoAsignados[letra].map((emp) => (
                                            <div key={emp.id} className="empleado-section">
                                                <div
                                                    className={`empleado ${emp.asignado ? "asignado" : ""}`}
                                                    onClick={() => toggleEmpleado(emp.id)}
                                                >
                                                    <div>
                                                        {emp.name}
                                                        {emp.asignado && (
                                                            <span className="info-asignacion">
                                                                {" - " + emp.puesto + " (" + emp.horario + ")"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {/* Botón X para borrar asignación */}
                                                        {emp.asignado && (
                                                            <button
                                                                className="btn-borrar"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    borrarAsignacion(emp.id, "", "");
                                                                }}
                                                            >
                                                                ✖
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Desplegable para asignar puesto y hora */}
                                                {activo === emp.id && (
                                                    <div className="desplegable">
                                                        <p>
                                                            <strong>Edad:</strong> {emp.age}
                                                        </p>
                                                        <p>
                                                            <strong>Ciudad:</strong> {emp.city}
                                                        </p>
                                                        <Link to={`/perfil/${emp.id}`} className="enlace-perfil">
                                                            Ver más información
                                                        </Link>

                                                        <label>
                                                            Puesto:
                                                            <select id={`puesto-${emp.id}`} defaultValue={emp.puesto}>
                                                                <option value="">Selecciona un puesto</option>
                                                                <option value="Barra 1">Barra 1</option>
                                                                <option value="Barra 2">Barra 2</option>
                                                                <option value="Barra 3">Barra 3</option>
                                                                <option value="Barra 4">Barra 4</option>
                                                                <option value="Barra 5">Barra 5</option>
                                                                <option value="Barra 6">Barra 6</option>
                                                                <option value="Barra 7">Barra 7</option>
                                                                <option value="Barra 8">Barra 8</option>
                                                                <option value="Barra 9">Barra 9</option>
                                                                <option value="Barra 10">Barra 10</option>
                                                            </select>
                                                        </label>

                                                        <label>
                                                            Horario inicio:
                                                            <select id={`horario-inicio-${emp.id}`} defaultValue="">
                                                                <option value="">--</option>
                                                                {Array.from({ length: 24 }, (_, i) => (
                                                                    <option
                                                                        key={i}
                                                                        value={`${String(i).padStart(2, "0")}:00`}
                                                                    >
                                                                        {String(i).padStart(2, "0")}:00
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </label>

                                                        <label>
                                                            Horario fin:
                                                            <select id={`horario-fin-${emp.id}`} defaultValue="">
                                                                <option value="">--</option>
                                                                {Array.from({ length: 24 }, (_, i) => (
                                                                    <option
                                                                        key={i}
                                                                        value={`${String(i).padStart(2, "0")}:00`}
                                                                    >
                                                                        {String(i).padStart(2, "0")}:00
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </label>

                                                        <button
                                                            onClick={() => {
                                                                const puesto = document.getElementById(
                                                                    `puesto-${emp.id}`
                                                                ).value;
                                                                const inicio = document.getElementById(
                                                                    `horario-inicio-${emp.id}`
                                                                ).value;
                                                                const fin = document.getElementById(
                                                                    `horario-fin-${emp.id}`
                                                                ).value;

                                                                guardarAsignacion(emp.id, puesto, `${inicio}-${fin}`);
                                                            }}
                                                        >
                                                            Guardar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* columna derecha agrupados por barra como en actuaciones por escenario */}
                <div className="col-12 col-lg-6">
                    <div className="card h-100">
                        <div className="card-header bg-light">
                            <strong>Asignados</strong>{" "}
                            {asignados.length > 0 && (
                                <span className="text-muted">({asignados.length})</span>
                            )}
                        </div>

                        <div className="list-group list-group-flush">
                            {asignados.length === 0 ? (
                                <div className="list-group-item text-muted">
                                    No hay personal asignado
                                </div>
                            ) : (
                                Object.keys(gruposPorBarra)
                                    .sort((a, b) => a.localeCompare(b))
                                    .map((barra) => (
                                        <div key={barra} className="border-top">
                                            <div className="px-3 py-2 bg-white fw-semibold">{barra}</div>

                                            {gruposPorBarra[barra].map((emp) => (
                                                <div key={emp.id} className="list-group-item">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <strong>{emp.name}</strong>{" "}
                                                            <span className="ms-2">
                                                                <span className="badge text-bg-primary me-2">
                                                                    {emp.puesto || "Sin puesto"}
                                                                </span>
                                                                <span className="badge text-bg-secondary">
                                                                    {emp.horario || "--:--"}
                                                                </span>
                                                            </span>
                                                        </div>

                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => borrarAsignacion(emp.id)}
                                                            title="Quitar asignación"
                                                        >
                                                            ✖
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
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
