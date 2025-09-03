import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/personallist.css";

export default function Personal() {
    const [empleados, setEmpleados] = useState([]);
    const [activo, setActivo] = useState(null);
    const [busqueda, setBusqueda] = useState("");


    //  Cargar empleados desde backend
    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "/api/users/personal")
            .then((res) => res.json())
            .then((data) => {
                setEmpleados(data);
            })
            .catch((err) => console.error("Error cargando empleados:", err));
    }, []);

    // Toggle desplegable
    const toggleEmpleado = (id) => {
        setActivo(activo === id ? null : id);
    };

    // Guardar asignación
    const guardarAsignacion = (id, puesto, horario) => {
        setEmpleados(
            empleados.map((e) =>
                e.id === id
                    ? { ...e, puesto, horario, asignado: true }
                    : e
            )
        );
        setActivo(null);
    };

    // Borrar asignación
    const borrarAsignacion = (id) => {
        setEmpleados(
            empleados.map((e) =>
                e.id === id
                    ? { ...e, puesto: "", horario: "", asignado: false }
                    : e
            )
        );
    };

    // Filtrado por búsqueda
    const empleadosFiltrados = empleados.filter((emp) =>
        emp?.name?.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Agrupación por inicial
    const grupos = empleadosFiltrados.reduce((acc, emp) => {
        if (!emp?.name) return acc;
        const letra = emp.name[0].toUpperCase();
        if (!acc[letra]) acc[letra] = [];
        acc[letra].push(emp);
        return acc;
    }, {});

    return (
        <div className="personal-container">
            <h2 className="title">Personal</h2>

            {/* Buscador */}
            <input
                className="buscador"
                type="text"
                placeholder="Buscar empleado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
            />

            {/* Lista de empleados */}
            {Object.keys(grupos)
                .sort()
                .map((letra) => (
                    <div key={letra}>
                        <div className="grupo-header">{letra}</div>
                        {grupos[letra].map((emp) => (
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
                                        <p><strong>Edad:</strong> {emp.age}</p>
                                        <p><strong>Ciudad:</strong> {emp.city}</p>
                                        <Link
                                            to="/perfil"
                                            className="enlace-perfil"
                                        >
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
                                                    <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
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
                                                    <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                                                        {String(i).padStart(2, "0")}:00
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <button
                                            onClick={() => {
                                                const puesto = document.getElementById(`puesto-${emp.id}`).value;
                                                const inicio = document.getElementById(`horario-inicio-${emp.id}`).value;
                                                const fin = document.getElementById(`horario-fin-${emp.id}`).value;

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
    );
}
