import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import "../styles/festiactual.css";
import CloudinaryUploader from "../components/Cloudinary";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../ThemeContext";

const FestiActual = () => {
  const [imagenFestival, setImagenFestival] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [activo, setActivo] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [actuaciones, setActuaciones] = useState([]);
  const { user } = useAuth();

  const ESCENARIOS = ["Escenario 1", "Escenario 2", "Escenario 3", "Escenario 4", "Escenario 5"];
  const HORAS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
  const toggleEmpleado = (id) => setActivo((prev) => (prev === id ? null : id));
  // Función para manejar la carga de imagen
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFestival(URL.createObjectURL(file));
    }
  };

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
      // si no hay usuario o no es organizador, no pidas nada
      if (!user || user.role !== "organizador") {
        setEmpleados([]);
        return;
      }
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/users/personal", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn("Error /users/personal:", res.status, err);
          setEmpleados([]);
          return;
        }
        const data = await res.json().catch(() => []);
        setEmpleados(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando empleados:", err);
        setEmpleados([]);
      }
    };
    loadPersonal();
  }, [user]);



  //  Obtener usuario para luego poder manejar el rol
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     let token = sessionStorage.getItem("token");
  //     const myHeaders = new Headers();
  //     myHeaders.append("Authorization", `Bearer ${token}`);

  //     const requestOptions = {
  //       method: "GET",
  //       headers: myHeaders,
  //     };

  //     try {
  //       const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/me", requestOptions);
  //       const result = await response.json();
  //       console.log(result);
  //       if (!response.ok) {
  //         console.error(`Error al obtener usuario: ${response.status} ${response.statusText}`);
  //         setUser(null);
  //         return;
  //       }

  //       setUser(result);
  //       console.log("Usuario cargado:", result);
  //     } catch (error) {
  //       console.error("Error fetch user:", error);
  //       setUser(null);
  //     }
  //   };
  //   fetchUser();
  // }, []);


  // Actualizar foto con la URL de Cloudinary
  /* const putFotoFesti = async (url) => {

    let token = sessionStorage.getItem("token");

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const raw = JSON.stringify({ photo: url });

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/festival/photo",
        requestOptions
      );
      if (response.status !== 200) {
        throw new Error("Error al actualizar la foto del festival");
      }
      dispatch({
        type: "SET_MESSAGE",
        payload: "Foto del festival actualizada correctamente",
      });
      dispatch({ type: "SET_SHOW_MESSAGE", payload: true });
      getPerfil();
    } catch (error) {
      console.error(error);
      dispatch({
        type: "SET_MESSAGE",
        payload: "Error al actualizar la foto del festival",
      });
      dispatch({ type: "SET_SHOW_MESSAGE", payload: true });
    }
  }; */


  // Filtrado por búsqueda empleado
  const empleadosFiltrados = (Array.isArray(empleados) ? empleados : []).filter((emp) =>
    (emp?.name || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const grupos = empleadosFiltrados.reduce((acc, emp) => {
    const letra = (emp?.name?.[0] || "").toUpperCase();
    if (!letra) return acc;
    (acc[letra] ||= []).push(emp);
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

  const { darkMode } = useTheme();

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
      <Link to="/personal"><h3>Lista de empleados</h3></Link>
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
      <Link to="/actuaciones"><h3 className="head">Lista de actuaciones</h3></Link>
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
                      {" - " + (act.escenario || "Sin escenario") + " (" + (act.horario || "Sin horario") + ")"}
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
