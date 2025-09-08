import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { useAuth } from "../auth/AuthContext";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { createContext, useState, useEffect, useContext, useMemo } from "react";
import { useTheme } from "../../ThemeContext"; // modo noche
import Logo from "../assets/img/Logo.png";
import LogoDark from "../assets/img/LogoDark.png";
import Letras from "../assets/img/Letras.png";
import LetrasDark from "../assets/img/LetrasDark.png";
import "../index.css";

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

	const { darkMode, toggleModo } = useTheme();

	//cerrar el navbar al hacer click
	const closeCollapse = (id) => {
		const el = document.getElementById(id);
		if (el && el.classList.contains("show")) el.classList.remove("show");
	};


	return (
		<nav className={`navbar navbar-expand-lg ${darkMode ? "navbar-dark nav-dark" : "navbar-light bg-light"}`}>
			<div className="container-fluid px-3">
				{!token ? (
					//Navbar sin sesión
					<>
						<Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
							<img src={darkMode ? LetrasDark : Letras} alt="Letras Fiesti" className="letrasNav" />
						</Link>

						<button
							className="navbar-toggler"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#navbarNoAuth"
							aria-controls="navbarNoAuth"
							aria-expanded="false"
							aria-label="Toggle navigation"
						>
							<i className="burger fa-solid fa-burger"></i>
						</button>

						<div className="collapse navbar-collapse" id="navbarNoAuth">
							<ul className="navbar-nav ms-auto align-items-lg-center gap-2 mt-3 mt-lg-0">
								<li className="nav-item">
									<button className="modo btn-reset" onClick={() => { toggleModo(); closeCollapse("navbarNoAuth"); }} aria-label="Cambiar tema">
										{darkMode ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
									</button>
								</li>
								<li className="nav-item">
									<Link className="btn-loginNav" to="/login"><b>Iniciar sesión</b></Link>
								</li>
								<li className="nav-item">
									<Link className="btn-signupNav" to="/signup"><b>Crear cuenta</b></Link>
								</li>
							</ul>
						</div>
					</>
				) : (
					//Navbar con sesión
					<>
						<Link to="/festi">
							<img
								src={darkMode ? LogoDark : Logo}
								alt="Logo Fiesti"
								className="logoNav mb-4"
							/>
						</Link>

						<button
							className="navbar-toggler mb-4"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#navbarNav"
							aria-controls="navbarNav"
							aria-expanded="false"
							aria-label="Toggle navigation"
						>
							<i className="burger fa-solid fa-burger"></i>
						</button>

						<div className="collapse navbar-collapse justify-content-lg-end" id="navbarNav">
							<ul className="navbar-nav ms-auto flex-lg-row flex-column align-items-lg-center align-items-end text-end text-lg-start gap-2">
								{/* Modo noche */}
								<li className="nav-item">
									<button className="modo btn-reset" onClick={() => { toggleModo(); closeCollapse("navbarNav"); }} aria-label="Cambiar tema">
										{darkMode ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
									</button>
								</li>


								{/* Solo ORGANIZADOR: Actuaciones y Personal */}
								{role === "organizador" && (
									<>
										<li className="nav-item">
											<Link className="btn-actuacionesNav" to="/actuaciones" onClick={() => closeCollapse("navbarNav")}>
												Actuaciones
											</Link>
										</li>
										<li className="nav-item">
											<Link className="btn-personalNav" to="/personal" onClick={() => closeCollapse("navbarNav")}>
												Personal
											</Link>
										</li>
									</>
								)}

								{/* siempre visible para usuarios logueados */}
								<li className="nav-item">
									<Link className="btn-perfilNav" to="/perfil" onClick={() => closeCollapse("navbarNav")}>
										Perfil
									</Link>
								</li>

								{/* logout destacado y separado */}
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