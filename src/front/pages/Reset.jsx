import React, { useState, useEffect } from 'react';
import "../styles/form.css";
import { useNavigate } from 'react-router-dom';
import Logo from "../assets/img/Logo.png";
import LogoDark from "../assets/img/LogoDark.png";
import Letras from "../assets/img/Letras.png";
import LetrasDark from "../assets/img/LetrasDark.png";
import { useTheme } from "../../ThemeContext";

const Reset = () => {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [confirmSuccess, setConfirmSuccess] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({
        strength: 0,
        feedback: 'Introduce una contraseña',
        color: 'var(--gray-color)'
    });
    const [isFormValid, setIsFormValid] = useState(false);

    const token = new URLSearchParams(location.search).get("token");

    // 👁 estados para mostrar/ocultar contraseñas
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const checkPasswordStrength = (password) => {
        let strength = 0;
        let feedback = '';
        let color = '';

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (password.length === 0) {
            feedback = 'Introduce una contraseña';
            color = '#fffbe5';
        } else if (strength <= 2) {
            feedback = 'Contraseña débil';
            color = '#78141e';
        } else if (strength <= 3) {
            feedback = 'Contraseña moderada';
            color = '#fac263';
        } else {
            feedback = 'Contraseña fuerte';
            color = '#2d435b';
        }

        return { strength, feedback, color };
    };

    const validatePasswordMatch = () => {
        if (confirmPassword.length === 0) {
            setConfirmError('');
            setConfirmSuccess('');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setConfirmError('Las contraseñas no coinciden');
            setConfirmSuccess('');
            return false;
        } else if (newPassword.length >= 8) {
            setConfirmError('');
            setConfirmSuccess('¡Las contraseñas coinciden!');
            return true;
        }

        return false;
    };

    useEffect(() => {
        const strength = checkPasswordStrength(newPassword);
        setPasswordStrength(strength);

        if (newPassword.length > 0 && newPassword.length < 8) {
            setPasswordError('La contraseña debe tener mínimo 8 caracteres.');
        } else {
            setPasswordError('');
        }

        const isMatchValid = validatePasswordMatch();
        setIsFormValid(newPassword.length >= 8 && isMatchValid);
    }, [newPassword, confirmPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setConfirmError('Las contraseñas no coinciden');
            return;
        }

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/reset_password_token/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Tu contraseña ha sido actualizada correctamente.");
                navigate("/login");
            } else {
                alert(`❌ Error: ${data.msg}`);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            alert("Error en el servidor. Inténtalo de nuevo.");
        }
    };

    const getNewPasswordClassName = () => passwordError ? ' error' : '';
    const getConfirmPasswordClassName = () => {
        if (confirmError) return ' error';
        if (confirmSuccess) return ' success';
        return '';
    };

    const strengthPercentage = (passwordStrength.strength / 5) * 100;
    const { darkMode } = useTheme();

    return (
        <div className="fiesti-container">
            <div className="fiesti-logo">
                <img src={darkMode ? LogoDark : Logo} className="img-fluid" alt="Logo Fiesti" style={{ maxWidth: 150 }} />
                <img src={darkMode ? LetrasDark : Letras} alt="Letras Fiesti" className="letras mb-4" />
                <p>🎉 La forma más fácil, rápida y segura de organizar tus eventos y celebraciones 🎉</p>
            </div>

            <div className="fiesti-form-container">
                <div className="fiesti-form-card">
                    <h2 className="fiesti-form-title">Crear contraseña nueva</h2>
                    <form onSubmit={handleSubmit}>

                        {/* Contraseña nueva */}
                        <div className="fiesti-form-group reset-password-wrapper">
                            <label htmlFor="newPassword">Contraseña nueva</label>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={getNewPasswordClassName()}
                                required
                            />
                            {newPassword && (
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword((v) => !v)}
                                    className="password-reset-btn"
                                    tabIndex={-1}
                                    aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    <i className={`bi ${showNewPassword ? "bi-eye-slash" : "bi-eye-fill"}`}></i>
                                </button>
                            )}
                            <div className="fiesti-password-strength">
                                <div className="fiesti-strength-bar">
                                    <div
                                        className="fiesti-strength-fill"
                                        style={{
                                            width: `${strengthPercentage}%`,
                                            backgroundColor: passwordStrength.color
                                        }}
                                    ></div>
                                </div>
                                <div className="fiesti-strength-text">{passwordStrength.feedback}</div>
                            </div>
                            {passwordError && <div className="fiesti-error-message">{passwordError}</div>}
                        </div>

                        {/* Confirmar contraseña */}
                        <div className="fiesti-form-group confirm-password-wrapper">
                            <label htmlFor="confirmPassword">Confirmar contraseña</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={getConfirmPasswordClassName()}
                                required
                            />
                            {confirmPassword && (
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    className="password-confirm-btn"
                                    tabIndex={-1}
                                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye-fill"}`}></i>
                                </button>
                            )}
                            {confirmError && <div className="fiesti-error-message">{confirmError}</div>}
                            {confirmSuccess && <div className="fiesti-success-message">{confirmSuccess}</div>}
                        </div>

                        <button
                            type="submit"
                            className="fiesti-submit-btn"
                            disabled={!isFormValid}
                        >
                            Establecer contraseña
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Reset;
