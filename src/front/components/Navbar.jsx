import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
	const navigate = useNavigate();
	const token = localStorage.getItem("token"); // cuando login, guardo aquí el JWT

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/login");
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-light">
			<div className="container">
				{!token ? (
					// Navbar cuando NO hay sesión
					<>
						<Link className="navbar-brand fw-bold" to="/">
							Fiesti
						</Link>
						<div className="ms-auto d-flex gap-2">
							<Link
								className="btn"
								style={{ backgroundColor: "#800020", color: "white" }}
								to="/login"
							>
								Iniciar sesión
							</Link>
							<Link
								className="btn"
								style={{ backgroundColor: "#b26688", color: "white" }}
								to="/signup"
							>
								Crear cuenta
							</Link>
						</div>
					</>
				) : (
					// Navbar cuando HAY sesión
					<>
						<Link className="navbar-brand" to="/festi-actual">
							<i className="fa-solid fa-arrow-left"></i>
						</Link>

						<button
							className="navbar-toggler"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#navbarNav"
						>
							<span className="navbar-toggler-icon"></span>
						</button>

						<div className="collapse navbar-collapse" id="navbarNav">
							<ul className="navbar-nav ms-auto gap-2">
								<li className="nav-item">
									<Link
										className="btn"
										style={{ backgroundColor: "#800020", color: "white" }}
										to="/actuaciones"
									>
										Actuaciones
									</Link>
								</li>
								<li className="nav-item">
									<Link
										className="btn"
										style={{ backgroundColor: "#b26688", color: "white" }}
										to="/perfil"
									>
										Perfil
									</Link>
								</li>
								<li className="nav-item ms-3">
									<button
										className="btn px-4"
										style={{
											backgroundColor: "#dc3545",
											color: "white",
											fontWeight: "bold"
										}}
										onClick={handleLogout}
									>
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