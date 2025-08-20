import useGlobalReducer from "../hooks/useGlobalReducer";


export const Perfil = (name, email, phone) => {

  const { store, dispatch } = useGlobalReducer()

  return (
    <div className="infoPerfil">
      <h1>Perfil</h1>
      <img src="https://cdn-icons-png.flaticon.com/512/146/146035.png"></img>
      <h2 className="nombre">{name}</h2> <span> <i class="fa-solid fa-pen-to-square"></i> </span>
      <p className="email">{email}</p>

      <div className="telefono">
        <h3>{phone}</h3> <span> <i class="fa-solid fa-pen-to-square"></i> </span>
      </div>

      <div className="payment">
        <h3>Método de pago seleccionado:</h3> <span> <i class="fa-solid fa-pen-to-square"></i> </span>
        

      </div>
    </div>
  );
};

export default Perfil;