import React, { useEffect } from "react"
import Logo from "../assets/img/Logo.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

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
		<div className="text-center mt-5">
			<img src={Logo} className="img-fluid mb-3" alt="Logo Fiesti" style={{maxWidth: 150}}/>
			<h1>Fiesti</h1>

			<h2 className="lead fw-bold ">
				🎉La forma más fácil, rápida y segura de organizar tus eventos y celebraciones🎉
			</h2>
			<p className="mt-3">
				Con <strong>Fiesti</strong>, conecta organizadores con personal especializado.
			</p>
			<p className="mt-3">
				Si quieres formar parte de un festival, podrás mostrar tu disponibilidad para ser elegido en el puesto que más encaje contigo.
			</p>
			<p className="mt-3">
				Si eres organizador, podrás gestionar el personal disponible y los horarios de las actuaciones para cubrir todas las necesidades del evento.
			</p>


			{/* Login y Signup */}
			<div className="d-grid gap-3 col-6 col-md-4 mx-auto mt-4">
				<button className="btn-login btn-lg" onClick={() => navigate("/login")}>
					<b>Iniciar sesión</b>
				</button>
				<button className="btn-signup btn-lg" onClick={() => navigate("/signup")}>
					<b>Crear cuenta</b>
				</button>
			</div>
		</div>
	);
};