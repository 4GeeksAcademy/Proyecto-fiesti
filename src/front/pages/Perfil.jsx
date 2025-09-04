import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState, useEffect } from "react";
import "../styles/perfil.css";
import { useNavigate, useParams } from "react-router-dom";
import CloudinaryUploader from "../components/Cloudinary";

export const Perfil = () => {
  let navigate = useNavigate();

  const { userId } = useParams();
  const isOwnProfile = !userId;

  const { store, dispatch } = useGlobalReducer();

  const [perfil, setPerfil] = useState({});
  const [needsPayment, setNeedsPayment] = useState(false);

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
      const url = userId
        ? import.meta.env.VITE_BACKEND_URL + `/api/perfil/${userId}`
        : import.meta.env.VITE_BACKEND_URL + "/api/perfil";

      const response = await fetch(url, { method: "GET", headers: myHeaders });
      const result = await response.json();

      if (!response.ok) {
        navigate("/login");
        throw new Error("Error fetching profile data");
      }

      setPerfil(result.user || {});
      if (isOwnProfile) {
        const mustPay =
          result.user?.role === "organizador" && !result.user?.card_number;
        setNeedsPayment(mustPay);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getPerfil();
  }, [userId]);

  // Estado para saber qué campo se está editando
  const [editando, setEditando] = useState(null);
  const [valorTemp, setValorTemp] = useState("");

  // Iniciar edición
  const handleEditar = (campo, valorInicial) => {
    if (!isOwnProfile) return; 
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
    if (!isOwnProfile) return;
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
    if (!isOwnProfile) return;
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

  const [payMsg, setPayMsg] = useState("");
  const [card, setCard] = useState({
    card_holder: "",
    card_number: "",
    card_cvc: "",
    card_expiration: "",
  });

  const doPay = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;
    setPayMsg("");
    const token = sessionStorage.getItem("token");

    try {
      const resp = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/perfil/pago",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(card),
        }
      );
      const data = await resp.json();
      if (!resp.ok) {
        setPayMsg(data.msg || "❌ Error en el pago");
        return;
      }
      setPayMsg("✅ Pago registrado");
      // el backend debería devolver { user: {...} }
      if (data.user) setPerfil(data.user);
      setNeedsPayment(false); // ya no se muestra el bloque
    } catch (err) {
      console.error(err);
      setPayMsg("❌ Error de conexión");
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

      {/* pago solo organizador sin tarjeta, una vez paga desaparece */}
      {needsPayment && (
        <div className="card card-body border-danger mt-4" style={{ maxWidth: 720 }}>
          <h5 className="text-danger">Completa tu pago de organizador</h5>
          {payMsg && <div className="alert alert-info my-2">{payMsg}</div>}

          <form onSubmit={doPay} className="row g-3">
            <div className="col-12">
              <label className="form-label">Titular</label>
              <input
                className="form-control"
                value={card.card_holder}
                onChange={(e) => setCard({ ...card, card_holder: e.target.value })}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Número de tarjeta</label>
              <input
                className="form-control"
                inputMode="numeric"
                placeholder="4111 1111 1111 1111"
                value={card.card_number}
                onChange={(e) => setCard({ ...card, card_number: e.target.value })}
                required
              />
            </div>

            <div className="col-4">
              <label className="form-label">CVC</label>
              <input
                className="form-control"
                inputMode="numeric"
                value={card.card_cvc}
                onChange={(e) => setCard({ ...card, card_cvc: e.target.value })}
                required
              />
            </div>

            <div className="col-8">
              <label className="form-label">Caducidad (MM/AAAA)</label>
              <input
                className="form-control"
                placeholder="MM/AAAA"
                value={card.card_expiration}
                onChange={(e) => setCard({ ...card, card_expiration: e.target.value })}
                required
              />
            </div>

            <div className="col-12 d-grid d-sm-flex gap-2 mt-2">
              <button className="btn btn-primary">Pagar</button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/festi")}
              >
                Ahora no
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Perfil;