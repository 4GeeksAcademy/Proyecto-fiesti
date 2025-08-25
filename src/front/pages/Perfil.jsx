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
      const response = await fetch(import.meta.env.VITE_BACKEND_URL +"/api/perfil", requestOptions);
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


  return (

    <div className="infoPerfil text-center">
      <h1>Perfil</h1> <span></span>
      <img src={perfil.photo} className="profilePic"></img> <span> <i className="fa-solid fa-pen-to-square" type="button"></i> </span>
      <h2 className="nombre">{perfil.name}
        <span> <i className="fa-solid fa-pen-to-square" type="button"></i> </span>
      </h2>
      <p className="email text-primary">{perfil.email}</p>

      <div className="telefono">
        <h3>{perfil.phone}
          <span> <i className="fa-solid fa-pen-to-square" type="button"></i> </span>
        </h3>
      </div>

      <div className="payment">
        <h3>Método de pago seleccionado:
          <span> <i className="fa-solid fa-pen-to-square" type="button"></i> </span>
        </h3>
        {/* traer del fecth el método de pago */}


      </div>

    </div>
  );
};

export default Perfil;