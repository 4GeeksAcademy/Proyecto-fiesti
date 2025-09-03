import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState, useEffect } from "react";
import "../styles/perfil.css";
import { useNavigate } from "react-router-dom";
import CloudinaryUploader from "../components/Cloudinary";

export const Perfil = () => {
  let navigate = useNavigate();

  const { store, dispatch } = useGlobalReducer();

  const [perfil, setPerfil] = useState({});

  async function getPerfil() {
    let token = sessionStorage.getItem("token");

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/perfil",
        requestOptions
      );
      const result = await response.json();
      if (response.status !== 200) {
        navigate("/login");
        throw new Error("Error fetching profile data");
      }
      setPerfil(result.user);
    } catch (error) {
      console.error(error);
    }
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
        payload: "Error al actualizar el perfil",
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

  // Actualizar perfil después de editar campos
  const putPerfil = async () => {
    let token = sessionStorage.getItem("token");

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const raw = JSON.stringify({
      [editando]: valorTemp,
    });

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/perfil",
        requestOptions
      );
      const result = await response.json();
      if (response.status !== 200) {
        navigate("/login");
        throw new Error("Error updating profile data");
      }
      dispatch({
        type: "SET_MESSAGE",
        payload: "Perfil actualizado correctamente",
      });
      dispatch({ type: "SET_SHOW_MESSAGE", payload: true });
      getPerfil();
    } catch (error) {
      console.error(error);
    }
  };

  // Actualizar foto con la URL de Cloudinary
  const putFotoPerfil = async (url) => {
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
        import.meta.env.VITE_BACKEND_URL + "/api/perfil/photo",
        requestOptions
      );
      if (response.status !== 200) {
        throw new Error("Error al actualizar la foto de perfil");
      }
      dispatch({
        type: "SET_MESSAGE",
        payload: "Foto de perfil actualizada correctamente",
      });
      dispatch({ type: "SET_SHOW_MESSAGE", payload: true });
      getPerfil();
    } catch (error) {
      console.error(error);
      dispatch({
        type: "SET_MESSAGE",
        payload: "Error al actualizar la foto de perfil",
      });
      dispatch({ type: "SET_SHOW_MESSAGE", payload: true });
    }
  };

  return (
    <div className="infoPerfil">
      <h1>Perfil</h1>

      {/* Imagen de perfil */}
      <div
        className="perfil-img-section"
        style={{ position: "relative", display: "inline-block" }}
      >
        <img src={perfil.photo} className="profilePic" alt="Foto perfil" />
        <CloudinaryUploader
          onUpload={(url) => putFotoPerfil(url)}
          className="edit-profile-btn"
        >
          <i className="fa-solid fa-pen-to-square"></i>
        </CloudinaryUploader>
      </div>

      {/* Nombre */}
      <h2 className="nombre">
        {editando === "name" ? (
          <input
            type="text"
            value={valorTemp}
            onChange={(e) => setValorTemp(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <>
            {perfil.name}
            <span>
              <i
                className="fa-solid fa-pen-to-square"
                type="button"
                onClick={() => handleEditar("name", perfil.name)}
              ></i>
            </span>
          </>
        )}
      </h2>

      {/* Email */}
      <p className="email">{perfil.email}</p>

      <div className="infoPerfil">
        {/* Teléfono */}
        <div className="telefono">
          <h3>
            Teléfono
            {editando === "phone" ? (
              <input
                type="text"
                value={valorTemp}
                onChange={(e) => setValorTemp(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            ) : (
              <>
                {" "}
                {perfil.phone}
                <span>
                  <i
                    className="fa-solid fa-pen-to-square"
                    type="button"
                    onClick={() => handleEditar("phone", perfil.phone)}
                  ></i>
                </span>
              </>
            )}
          </h3>
        </div>

        {/* Edad */}
        <div className="age">
          <h3>
            Edad
            {editando === "age" ? (
              <input
                type="text"
                value={valorTemp ?? ""}
                onChange={(e) => setValorTemp(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            ) : (
              <>
                {" "}
                {perfil.age}
                <span>
                  <i
                    className="fa-solid fa-pen-to-square"
                    type="button"
                    onClick={() => handleEditar("age", perfil.age)}
                  ></i>
                </span>
              </>
            )}
          </h3>
        </div>

        {/* Ciudad */}
        <div className="city">
          <h3>
            Ciudad
            {editando === "city" ? (
              <input
                type="text"
                value={valorTemp ?? ""}
                onChange={(e) => setValorTemp(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            ) : (
              <>
                {" "}
                {perfil.city}
                <span>
                  <i
                    className="fa-solid fa-pen-to-square"
                    type="button"
                    onClick={() => handleEditar("city", perfil.city)}
                  ></i>
                </span>
              </>
            )}
          </h3>
        </div>
      </div> {/* cierra infoPerfil */}

    </div>
  );
};

export default Perfil;
