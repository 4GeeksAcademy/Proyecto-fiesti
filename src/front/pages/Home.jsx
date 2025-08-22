import React, { useEffect } from "react"
import fiesti from "../assets/img/fiesti.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";

export const Home = () => {
	const navigate = useNavigate();
	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	useEffect(() => {
		loadMessage()
	}, [])

	return (
		<div className="text-center mt-5" style={{ backgroundColor: "#fffbe5"}}>
			<p className="lead">
				<img src={fiesti} className="img-fluid mb-3" alt="Logo Fiesti" />
			</p>

			<h2 className="lead fw-bold " style={{ color: "#800020" }}>
				🎉La forma más fácil, rápida y segura de organizar tus eventos y celebraciones 🎉
			</h2>
			<p className="mt-3 text-muted">
				Con <strong>Fiesti</strong>, conecta organizadores con personal especializado.
			</p>
			<p className="mt-3 text-muted">
				Si quieres formar parte de un festival, podrás mostrar tu disponibilidad para ser elegido en el puesto que más encaje contigo. 
			</p>
			<p className="mt-3 text-muted">
				Si eres organizador podrás gestionar el personal disponible y los horarios de las actuaciones para cubrir todas las necesidades del evento.
			</p>


			{/* Login y Signup */}
			<div className="d-grid gap-3 col-6 col-md-4 mx-auto mt-4">
				<button className="btn btn-lg" style={{ backgroundColor: "#800020", color:"#FFFBE5"  }} onClick={() => navigate("/login")}>
					Iniciar sesión
				</button>
				<button className="btn btn-lg" style={{ backgroundColor: "#E6A6B0", color:"#800020"  }} onClick={() => navigate("/signup")}>
					Crear cuenta
				</button>
			</div>
		</div>
	);
};