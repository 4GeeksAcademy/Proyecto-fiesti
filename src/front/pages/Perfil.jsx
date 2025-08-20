import useGlobalReducer from "../hooks/useGlobalReducer";


export const Perfil = () => {

  const { store, dispatch } = useGlobalReducer()

  // tengo que hacer un fetch para traer la info de name, email, phone y método de pago

  return (
    

    <div className="infoPerfil text-center">
      <h1>Perfil</h1> <span></span>
      <img src="https://cdn-icons-png.flaticon.com/512/146/146035.png" className="profilePic"></img>
      <h2 className="nombre">name
        <span> <i className="fa-solid fa-pen-to-square"></i> </span>
      </h2>
      <p className="email text-primary">email</p>

      <div className="telefono">
        <h3>phone
          <span> <i className="fa-solid fa-pen-to-square"></i> </span>
        </h3>
      </div>

      <div className="payment">
        <h3>Método de pago seleccionado:
          <span> <i className="fa-solid fa-pen-to-square"></i> </span>
        </h3>
        {/* traer del fecth el método de pago */}

      </div>
    </div>
  );
};

export default Perfil;