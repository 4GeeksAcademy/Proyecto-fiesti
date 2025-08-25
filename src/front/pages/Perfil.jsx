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
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/perfil", requestOptions);
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
  const handleGuardar = () => {
    setPerfil({ ...perfil, [editando]: valorTemp });
    setEditando(null);
    
  };

  // Guardar al pulsar Enter/Intro
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGuardar();
    }
  };


  return (
    <div className="infoPerfil text-center">
      <h1>Perfil</h1>
      <img src={perfil.photo} className="profilePic" alt="Foto perfil" />
      <h2 className="nombre">
        {editando === "name" ? (
          <>
            <input type="text" value={valorTemp} onChange={(e) => setValorTemp(e.target.value)} onKeyDown={handleKeyDown} autoFocus/>
            
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

      <p className="email text-primary">{perfil.email}</p>

      <div className="telefono">
        <h3>
          {editando === "phone" ? (
            <>
              <input type="text" value={valorTemp} onChange={(e) => setValorTemp(e.target.value)} onKeyDown={handleKeyDown} autoFocus/>
              
            </>
          ) : (
            <>
              {perfil.phone}
              <span> 
                <i className="fa-solid fa-pen-to-square" type="button" onClick={() => handleEditar("phone", perfil.phone)}></i>
              </span>
            </>
          )}
        </h3>
      </div>
    </div>
  );
};

export default Perfil;