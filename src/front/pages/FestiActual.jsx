import React, { useState, useEffect } from "react";
import "../styles/festiactual.css";

const FestiActual = () => {
  const [imagenFestival, setImagenFestival] = useState(null);
  const [user, setUser] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [activo, setActivo] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [actuaciones, setActuaciones] = useState([]);

  const ESCENARIOS = ["Escenario 1", "Escenario 2", "Escenario 3", "Escenario 4", "Escenario 5"];
  const HORAS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

  // Función para manejar la carga de imagen
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFestival(URL.createObjectURL(file));
    }
  };

  //  Cargar artistas/actuaciones desde backend
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

  //  Cargar empleados desde backend
  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/users/personal")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        setEmpleados(data);
      })
      .catch((err) => console.error("Error cargando empleados:", err));
  }, []);



  //  Obtener usuario para luego poder manejar el rol
  useEffect(() => {
    const fetchUser = async () => {
      let token = sessionStorage.getItem("token");
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
      };

      try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/me", requestOptions);
        const result = await response.json();
        console.log(result);
        if (!response.ok) {
          console.error(`Error al obtener usuario: ${response.status} ${response.statusText}`);
          setUser(null);
          return;
        }

        setUser(result);
        console.log("Usuario cargado:", result);
      } catch (error) {
        console.error("Error fetch user:", error);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Filtrado por búsqueda empleado
  const empleadosFiltrados = empleados.filter((emp) =>
    emp?.name?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agrupación por inicial empleados
  const grupos = empleadosFiltrados.reduce((acc, emp) => {
    if (!emp?.name) return acc;
    const letra = emp.name[0].toUpperCase();
    if (!acc[letra]) acc[letra] = [];
    acc[letra].push(emp);
    return acc;
  }, {});

  //  filtrado por búsqueda artista/actuaciones
  const filtradas = actuaciones.filter((a) =>
    (a.name || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agrupación por inicial actuaciones
  const gruposActuaciones = filtradas.reduce((acc, act) => {
    if (!act?.name) return acc;
    const letra = act.name[0].toUpperCase();
    if (!acc[letra]) acc[letra] = [];
    acc[letra].push(act);
    return acc;
  }, {});

  return (
    <div className="festi-container">
      <h1 className="festi-title">Festival Actual</h1>

      {/* Imagen del festival */}
      <div className="festi-img-section">
        <label className="festi-label">Cartel del Festival:</label>
        {imagenFestival && (
          <img src={imagenFestival} alt="Imagen del Festival" className="festi-img" />
        )}
        {user?.role === "organizador" && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
            className="festi-input"
          />
        )}
      </div>

      {/* Buscador */}
      <input
        className="buscador"
        type="text"
        placeholder="Buscar empleado o actuación..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* Lista de empleados */}
      <h3>Lista de empleados</h3>
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
                    <span className="info-asignacion">
                      {" - " + (emp.puesto || "Sin puesto") + " (" + (emp.horario || "Sin horario") + ")"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* Lista de actuaciones */}
      <h3 className="head">Lista de actuaciones</h3>
      {Object.keys(gruposActuaciones)
        .sort()
        .map((letra) => (
          <div key={letra}>
            <div className="grupo-header">{letra}</div>
            {gruposActuaciones[letra].map((act) => (
              <div key={act.id} className="actuacion-section">
                <div className="actuacion">
                  <div>
                    {act.name}
                    <span className="info-actuacion">
                      {" - " + (act.escenario || "Sin escenario") + " (" + (act.hora || "Sin horario") + ")"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default FestiActual;
