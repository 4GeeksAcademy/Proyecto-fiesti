import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { useAuth } from "../auth/AuthContext";
import { useMemo, useState } from "react";
import Logo from "../assets/img/Logo.png";

export const Navbar = () => {
	const navigate = useNavigate();
	const { token: ctxToken, user: ctxUser, logout } = useAuth();
	const token = ctxToken || sessionStorage.getItem("token");
	//token y user los guardamos en el login, mantener sesion
	const role = useMemo(() => {
		try {
			if (ctxUser?.role) return ctxUser.role;
			const raw = sessionStorage.getItem("user");
			return raw ? JSON.parse(raw).role : null;
		} catch {
			return null;
		}
	}, [ctxUser]);

	const handleLogout = () => {
		logout(); // limpia contexto + storage
		navigate("/login");
	};

	// ---------------Modo noche---------------------
	const [darkMode, setDarkMode] = useState(false);

	const toggleModo = () => {
		setDarkMode(!darkMode);
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-light">
			<div className="container">
				{!token ? (
					//Navbar sin sesión
					<>
						<Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
							<img src={Logo} alt="Logo Fiesti" className="logoNav" />
							Fiesti
						</Link>

						<div className="ms-auto d-flex gap-2">
							<Link className="btn-loginNav" to="/login">
								Iniciar sesión
							</Link>
							<Link className="btn-singupNav" to="/signup">
								Crear cuenta
							</Link>
						</div>
					</>
				) : (
					//Navbar con sesión
					<>
						{/* Logo que lleva a Festi actual */}
						<Link to="/festi" className="d-flex align-items-center">
							<img src={Logo} alt="Logo Fiesti" className="logoNav mb-4" />
						</Link>

						<button
							className="navbar-toggler"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#navbarNav"
							aria-controls="navbarNav"
							aria-expanded="false"
							aria-label="Toggle navigation"
						>
							<span className="navbar-toggler-icon"></span>
						</button>

						<div className="collapse navbar-collapse" id="navbarNav">
							<ul className="navbar-nav ms-auto gap-2 align-items-center">
								{/* Modo noche */}
								<li className="modo" onClick={toggleModo} style={{ cursor: "pointer" }}>
									{darkMode ? (
										<i className="fa-solid fa-sun"></i>
									) : (
										<i className="fa-solid fa-moon"></i>
									)}
								</li>

								{/* siempre visible para usuarios logueados */}
								<li className="nav-item">
									<Link className="btn-perfilNav" to="/perfil">
										Perfil
									</Link>
								</li>

								{/* Solo ORGANIZADOR: Actuaciones y Personal */}
								{role === "organizador" && (
									<>
										<li className="nav-item">
											<Link className="btn-actuacionesNav" to="/actuaciones">
												Actuaciones
											</Link>
										</li>
										<li className="nav-item">
											<Link className="btn-personalNav" to="/personal">
												Personal
											</Link>
										</li>
									</>
								)}

								{/* Logout destacado y separado */}
								<li className="nav-item ms-3">
									<button className="btn-logoutNav px-4" onClick={handleLogout}>
										Salir
									</button>
								</li>
							</ul>
						</div>
					</>
				)}
			</div>
		</nav >
	);
};