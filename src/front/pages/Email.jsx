import React, { useState } from 'react';
import "../styles/form.css";

const EmailForm = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Limpiar mensajes anteriores
        setError('');
        setSuccess('');

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError('El correo electrónico es obligatorio');
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            setError('Introduce un correo electrónico válido');
            return;
        }

        setSuccess('¡Correo electrónico válido!');

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/reset_password_request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: trimmedEmail })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.msg); // "Si el email está en nuestros registros..."
            } else {
                setError(data.msg || "Error al enviar la solicitud");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            setError("Error en el servidor. Intenta nuevamente.");
        }


    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        // Limpiar mensajes cuando el usuario empiece a escribir
        if (error || success) {
            setError('');
            setSuccess('');
        }
    };

    const getInputClassName = () => {
        let className = '';
        if (error) className += ' error';
        if (success) className += ' success';
        return className;
    };

    return (
        <div className="fiesti-container">
            <div className="fiesti-logo">
                <h1>Fiesti</h1>
                <p>🎉 La forma más fácil, rápida y segura de organizar tus eventos y celebraciones 🎉</p>
            </div>

            <div className="fiesti-form-container">
                <div className="fiesti-form-card">
                    <h2 className="fiesti-form-title">Introduce tu correo electrónico</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="fiesti-form-group">
                            <label htmlFor="email">Correo electrónico</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={handleEmailChange}
                                className={getInputClassName()}
                                required
                            />
                            {error && <div className="fiesti-error-message">{error}</div>}
                            {success && <div className="fiesti-success-message">{success}</div>}
                        </div>
                        <button type="submit" className="fiesti-submit-btn">
                            Continuar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmailForm;