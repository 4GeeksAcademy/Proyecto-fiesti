import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState, useEffect } from "react";
import "../styles/perfil.css";
import { useNavigate } from "react-router-dom";


export const Perfil = () => {
  let navigate = useNavigate();

  const { store, dispatch } = useGlobalReducer()

  const [perfil, setPerfil] = useState({})

  async function getPerfil() {
    let token = sessionStorage.getItem("token");

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`); // Añade el token en la cabecera de autorización

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/perfil", requestOptions); // Coge la URL del .env y le añade el endpoint
      const result = await response.json();
      if (response.status !== 200) {
        navigate("/login");
        throw new Error("Error fetching profile data");
      }
      setPerfil(result.user)
    }
    catch (error) {
      console.error(error);
    };
  }

  useEffect(() => {
    getPerfil();
  }, []);


  // Estado para saber qué campo se está editando
  const [editando, setEditando] = useState(null);
  const [valorTemp, setValorTemp] = useState("");

  // Iniciar edición
  const handleEditar = (campo, valorInicial) => {
    setEditando(campo);
    setValorTemp(valorInicial);
  };


  // Guardar cambios
  const handleGuardar = async () => {
    try {
      await putPerfil();
      setPerfil({ ...perfil, [editando]: valorTemp });
      setEditando(null);
    } catch (error) {
      dispatch({
        type: "SET_MESSAGE",
        payload: "Error al actualizar el perfil"
      });
      dispatch({ type: "SET_SHOW_MESSAGE", payload: true });
    }
  };

  // Guardar al pulsar Enter/Intro
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGuardar();
    }
  };

  // Actualizar perfil después de editar
  const putPerfil = async () => {
    let token = sessionStorage.getItem("token");

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`); // Añade el token en la cabecera de autorización

    const raw = JSON.stringify({
      [editando]: valorTemp
    });

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/perfil", requestOptions); // Coge la URL del .env y le añade el endpoint
      const result = await response.json();
      if (response.status !== 200) {
        navigate("/login");
        throw new Error("Error updating profile data");
      }
      dispatch({ type: "SET_MESSAGE", payload: "Perfil actualizado correctamente" });
      dispatch({ type: "SET_SHOW_MESSAGE", payload: true });
      getPerfil() // Vuelve a cargar el perfil para que se actualice con los datos nuevos
    }
    catch (error) {
      console.error(error);
    };
  }

  // Estados para editar foto del perfil
  const [imagenPerfil, setImagenPerfil] = useState(null);

  // Buscar imagen en galería para cambiarla
  const handleImagenChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenPerfil(URL.createObjectURL(file)); // Para mostrar la imagen localmente

      // Subir al backend
      let token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("photo", file);

      try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/perfil/photo", {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
        if (response.status !== 200) {
          throw new Error("Error al subir la imagen");
        }
        dispatch({ type: "SET_MESSAGE", payload: "Imagen actualizada correctamente" });
        dispatch({ type: "SET_SHOW_MESSAGE", payload: true });
        getPerfil(); // Recarga el perfil con la nueva imagen
      } catch (error) {
        dispatch({ type: "SET_MESSAGE", payload: "Error al subir la imagen" });
        dispatch({ type: "SET_SHOW_MESSAGE", payload: true });
      }
    }
  };

  return (
    <div className="infoPerfil">
      <h1>Perfil</h1>

     {/* Imagen de perfil */}
      <div className="perfil-img-section" style={{ position: "relative", display: "inline-block" }}>
        <img src={imagenPerfil || perfil.photo} className="profilePic" alt="Foto perfil" />
        <input
          type="file"
          accept="image/*"
          onChange={handleImagenChange}
          className="perfil-input"
          style={{ display: 'none' }}
          id="fileInput"
        />
        <button
          type="button"
          className="edit-profile-btn"
          onClick={() => document.getElementById('fileInput').click()}
        >
          <i className="fa-solid fa-pen-to-square"></i>
        </button>
      </div>

     {/* Nombre */}
      <h2 className="nombre">
        {editando === "name" ? (
          <>
            <input type="text" value={valorTemp} onChange={(e) => setValorTemp(e.target.value)} onKeyDown={handleKeyDown} autoFocus /> {/* el autofocus hace que se ponga el cursor al final de la palabra para editar desde ahí */}

          </>
        ) : (
          <>
            {perfil.name}
            <span>
              <i className="fa-solid fa-pen-to-square" type="button" onClick={() => handleEditar("name", perfil.name)}></i>
            </span>
          </>
        )}
      </h2>

     {/* Email */}
      <p className="email">{perfil.email}</p>

     {/* Teléfono */}
      <div className="telefono">
        <h3>
          Teléfono:
          {editando === "phone" ? (
            <>
              <input type="text" value={valorTemp} onChange={(e) => setValorTemp(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
            </>
          ) : (
            <>
              {" "}{perfil.phone}
              <span>
                <i className="fa-solid fa-pen-to-square" type="button" onClick={() => handleEditar("phone", perfil.phone)}
                ></i>
              </span>
            </>
          )}
        </h3>
      </div>

      {/* Edad
      <div className="edad">
        <h3>
          Edad:
          {editando === "age" ? (
            <>
              <input type="text" value={valorTemp} onChange={(e) => setValorTemp(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
            </>
          ) : (
            <>
              {" "}{perfil.age}
              <span>
                <i className="fa-solid fa-pen-to-square" type="button" onClick={() => handleEditar("age", perfil.age)}
                ></i>
              </span>
            </>
          )}
        </h3>
      </div>

      {/* Ciudad */}
      {/* <div className="ciudad">
        <h3>
          Ciudad:
          {editando === "city" ? (
            <>
              <input type="text" value={valorTemp} onChange={(e) => setValorTemp(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
            </>
          ) : (
            <>
              {" "}{perfil.city}
              <span>
                <i className="fa-solid fa-pen-to-square" type="button" onClick={() => handleEditar("city", perfil.city)}
                ></i>
              </span>
            </>
          )}
        </h3>
      </div> */}

    </div>
  );
};

export default Perfil;