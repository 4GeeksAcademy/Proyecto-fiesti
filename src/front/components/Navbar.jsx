import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { useState, useEffect } from "react";
import Logo from "../assets/img/Logo.png";

export const Navbar = () => {
	const navigate = useNavigate();
	const token = sessionStorage.getItem("token");

	const handleLogout = () => {
		sessionStorage.removeItem("token");
		sessionStorage.removeItem("user");
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
					<>
						<Link className="navbar-brand fw-bold" to="/">Fiesti</Link>
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
					<>
						<Link to="/festi">
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
							<ul className="navbar-nav ms-auto gap-2">
								<li className="modo" onClick={toggleModo} style={{ cursor: "pointer" }}>
									{darkMode ? (
										<i className="fa-solid fa-sun"></i>
									) : (
										<i className="fa-solid fa-moon"></i>
									)}
								</li>
								<li className="nav-item">
									<Link
										className="btn-actuacionesNav" to="/actuaciones">
										Actuaciones
									</Link>
								</li>
								<li className="nav-item">
									<Link
										className="btn-personalNav" to="/personal">
										Personal
									</Link>
								</li>
								<li className="nav-item">
									<Link
										className="btn-perfilNav" to="/perfil" >
										Perfil
									</Link>
								</li>
								<li className="nav-item ms-3">
									<button
										className="btn-logoutNav px-4" onClick={handleLogout}>
										Salir
									</button>
								</li>
							</ul>
						</div>
					</>
				)}
			</div>
		</nav>
	);
};