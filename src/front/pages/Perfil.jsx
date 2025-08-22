import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState, useEffect } from "react";
import "../styles/perfil.css";
import Logo from "../assets/img/Logo.png";


export const Perfil = () => {

  const { store, dispatch } = useGlobalReducer()

  const [perfil, setPerfil] = useState({})

  const postUSer = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", ".Tunnels.Relay.WebForwarding.Cookies=CfDJ8Cs4yarcs6pKkdu0hlKHsZvBn844S0UVTSkZjz5uJYPFiZOYA3sSMdAhGF8QLat4BHUBo6FHxKtNqC0z0wJcrMe8SMJKqjXK8jjghGymP5V7SBqZNNQwFCTqZCW-OATK6AfgXOwmJ7YFJmWUl4fRKgmZ0xXN6aQOi2eqwH7s0jTtfC4iGPogPbhCGxzheIUI8W2R51Bs2FSVFyYsrQj7lX_PKEptp8C9oARjec2GJf81YVYp74mJljuUz0CGvg7jaZLAsAcGZhIylBiBlEAxqLJEv5Phu9Hx6yGN2irGp8HrDp6Nt507BwhcKKYS_YOC4kaWSxlhwpGYSNNIy6QE22LRAIORFyt1EeY-FiEo5vgAkyHsCgMgNEg1i7gTpUctNPx_R3wQ0xke7qleT9i9oLlgcVd5S6pc-Sht0-FNsq63fznvPKgXWUl20VfmwT54zcKab9nGewTjN4137bcl7g-ShFFJlK9H8BsIWkvVYp-ZyVQ8xXujbaDORQwD-2Iwu3eMSlb1R16srmS2bHc5UqJWChj5BPDXNuW1k_xY_WTNtxkHICNku-ZVBMAQpxFdPjlL66iTXK6K90D_QGhKQgvvxT3-SAuv8Hb4A8UoD3JMp1AIlloumj_hSAtt2rkKIrceJQSMk0ytXYeMx7FAO0fJZV3mL-JEasSamAra4jFCdqi3UMtsYifGT-sXpW2pENgDJjYsYkHvjkdECZ4RlyNvSGm_Ha1P5QdeFfwNz58CpOxCWC4XX4ehB1OZk2Gr-ppGitKd-VV6Xqx324dmjp-gS6n-PQEojV-_ifSJuidjJxhOiXXLLTaJVLsc0AFyim9PI3jOk8Ff32ItuxEUGlD-mYW9ovlGPkHcRa7zPeaXxfKOh3mE0YFna37ID9cq3PKKUNr5y2vLQn8ERX6lCleu9nhW5WUsl32CUoHRhJ6w2CPVJfR9YWVQw05MyikJV5hkjO9WmNsagQuWVocUgSxh-740Qi_uDIeyD3KKs2T6");

    const raw = JSON.stringify({
      "email": "pepe@gmail.com",
      "password": "123456"
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    fetch("https://verbose-spoon-4j66qqx7qgqw2qxpq-3001.app.github.dev/api/users", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setPerfil(result.user)

        console.log(result.user)
      })
      .catch((error) => console.error(error));
  }

  useEffect(() => {
    postUSer();
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