import React, { useState, useEffect } from "react";
import "./PersonalList.css";

export default function Personal() {
    const [empleados, setEmpleados] = useState([]);
    const [activo, setActivo] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [nuevoEmpleado, setNuevoEmpleado] = useState("");

    // Cargar empleados desde localStorage al iniciar
    useEffect(() => {
        const guardados = localStorage.getItem("empleados");
        if (guardados) {
            setEmpleados(JSON.parse(guardados));
        }
    }, []);

    // Guardar empleados en localStorage cada vez que cambien
    useEffect(() => {
        localStorage.setItem("empleados", JSON.stringify(empleados));
    }, [empleados]);

    // Alta de empleados
    const agregarEmpleado = (e) => {
        e.preventDefault();
        if (!nuevoEmpleado.trim()) return;
        const nuevo = {
            id: Date.now(),
            nombre: nuevoEmpleado,
            asignado: false,
            puesto: "",
            horario: "",
        };
        setEmpleados([...empleados, nuevo]);
        setNuevoEmpleado("");
    };

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

    // Filtrado por búsqueda
    const empleadosFiltrados = empleados.filter((emp) =>
        emp.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Agrupación por inicial
    const grupos = empleadosFiltrados.reduce((acc, emp) => {
        const letra = emp.nombre[0].toUpperCase();
        if (!acc[letra]) acc[letra] = [];
        acc[letra].push(emp);
        return acc;
    }, {});

    console.log("Renderizando componente");

    return (
        <div className="personal-container">
            <h2 className="title">Personal</h2>

            {/* Alta de empleados */}
            <form onSubmit={agregarEmpleado} className="alta-form">
                <input
                    type="text"
                    placeholder="Nombre del empleado"
                    value={nuevoEmpleado}
                    onChange={(e) => setNuevoEmpleado(e.target.value)}
                />
                <button type="submit">Agregar</button>
            </form>

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
                                    {emp.nombre}
                                    {emp.asignado && (
                                        <span className="info-asignacion">
                                            {" - " + emp.puesto + " (" + emp.horario + ")"}
                                        </span>
                                    )}
                                </div>
                                {activo === emp.id && (
                                    <div className="desplegable">
                                        <label>
                                            Puesto:
                                            <input
                                                type="text"
                                                defaultValue={emp.puesto}
                                                id={`puesto-${emp.id}`}
                                            />
                                        </label>
                                        <label>
                                            Horario:
                                            <input
                                                type="text"
                                                defaultValue={emp.horario}
                                                id={`horario-${emp.id}`}
                                            />
                                        </label>
                                        <button
                                            onClick={() =>
                                                guardarAsignacion(
                                                    emp.id,
                                                    document.getElementById(`puesto-${emp.id}`).value,
                                                    document.getElementById(`horario-${emp.id}`).value
                                                )
                                            }
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
