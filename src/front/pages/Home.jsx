import React, { useEffect } from "react";
import Logo from "../assets/img/Logo.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

export const Home = () => {
	const navigate = useNavigate();
	const { dispatch } = useGlobalReducer();

	const loadMessage = async (signal) => {
		const backendUrl = import.meta.env.VITE_BACKEND_URL;
		if (!backendUrl) {
			console.warn("VITE_BACKEND_URL no está definida en .env");
			return;
		}
		try {
			const resp = await fetch(backendUrl + "/api/hello", { signal });
			if (!resp.ok) {
				console.warn("No se pudo cargar /api/hello:", resp.status);
				return;
			}
			const data = await resp.json();
			if (data?.message) {
				dispatch({ type: "set_hello", payload: data.message });
			}
		} catch (err) {
			if (err.name !== "AbortError") {
				console.warn(
					"No se pudo obtener el mensaje del backend. ¿Backend levantado y público?",
					err
				);
			}
		}
	};

	useEffect(() => {
		// si ya hay sesión, manda directo a /festi
		const token = sessionStorage.getItem("token");
		if (token) {
			navigate("/festi", { replace: true });
			return;
		}
		const controller = new AbortController();
		loadMessage(controller.signal);
		return () => controller.abort();
	}, [navigate]);

	return (
		<div className="text-center mt-5">
			<img
				src={Logo}
				className="img-fluid mb-3"
				alt="Logo Fiesti"
				style={{ maxWidth: 150 }}
			/>
			<h1>Fiesti</h1>

			<h2 className="lead fw-bold">
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