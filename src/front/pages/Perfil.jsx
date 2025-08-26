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
 

  return (
    <div className="infoPerfil">
      <h1>Perfil</h1>
      <img src={perfil.photo} className="profilePic" alt="Foto perfil" />
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

      <p className="email">{perfil.email}</p>

      <div className="telefono">
        <h3>
          Teléfono:
          {editando === "phone" ? (
            <>
              <input type="text" value={valorTemp} onChange={(e) => setValorTemp(e.target.value)} onKeyDown={handleKeyDown} autoFocus/>
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
    </div>
  );
};

export default Perfil;