import React, { useState, useEffect } from "react";
import "../styles/festiactual.css";

const FestiActual = () => {
  const [imagenFestival, setImagenFestival] = useState(null);
  const [user, setUser] = useState(null);

  // Función para manejar la carga de imagen
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFestival(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      let token = sessionStorage.getItem("token")
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`)
      console.log(token);

      const requestOptions = {
        method: "GET",
        headers: myHeaders
      };

      try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/me", requestOptions);
        const result = await response.json();
        console.log(result)
      } catch (error) {
        console.error(error);
      };
      // try {
      //   const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/me", {
      //     headers: {
      //       "Authorization": `Bearer ${localStorage.getItem("token")}`
      //     }
      //   });

      //   if (!response.ok) {
      //     console.error(`Error al obtener usuario: ${response.status} ${response.statusText}`);
      //     setUser(null);
      //     return;
      //   }

      //   const data = await response.json();
      //   setUser(data);
      //   console.log("Usuario cargado:", data);

      // } catch (err) {
      //   console.error("Error fetch user:", err);
      //   setUser(null);
      // }
    };

    fetchUser();
  }, []);

  return (
    <div className="festi-container">
      <h1 className="festi-title">Festival Actual</h1>

      {/* Imagen del festival */}
      <div className="festi-img-section">
        <label className="festi-label">Cartel del Festival:</label>
        {imagenFestival && (
          <img
            src={imagenFestival}
            alt="Imagen del Festival"
            className="festi-img"
          />
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
    </div>
  );
};

export default FestiActual;
