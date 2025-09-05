import React, { useState, useEffect } from 'react';
import "../styles/form.css";
import { useLocation, useNavigate } from 'react-router-dom';

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
        color: '#e8ddd4'
    });
    const [isFormValid, setIsFormValid] = useState(false);

    const token = new URLSearchParams(location.search).get("token")

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
            color = '#e8ddd4';
        } else if (strength <= 2) {
            feedback = 'Contraseña débil';
            color = '#e74c3c';
        } else if (strength <= 3) {
            feedback = 'Contraseña moderada';
            color = '#f39c12';
        } else {
            feedback = 'Contraseña fuerte';
            color = '#27ae60';
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

        // Validar longitud mínima
        if (newPassword.length > 0 && newPassword.length < 8) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres');
        } else {
            setPasswordError('');
        }

        // Validar coincidencia de contraseñas
        const isMatchValid = validatePasswordMatch();

        // El formulario es válido si la contraseña tiene al menos 8 caracteres y las contraseñas coinciden
        setIsFormValid(newPassword.length >= 8 && isMatchValid);
    }, [newPassword, confirmPassword]);

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ password: newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Tu contraseña ha sido actualizada exitosamente.");
                navigate("/login");
            } else {
                alert(`❌ Error: ${data.msg}`);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            alert("Error en el servidor. Intenta nuevamente.");
        }

    };

    const getNewPasswordClassName = () => {
        return passwordError ? ' error' : '';
    };

    const getConfirmPasswordClassName = () => {
        if (confirmError) return ' error';
        if (confirmSuccess) return ' success';
        return '';
    };

    const strengthPercentage = (passwordStrength.strength / 5) * 100;

    return (
        <div className="fiesti-container">
            <div className="fiesti-logo">
                <h1>Fiesti</h1>
                <p>🎉 La forma más fácil, rápida y segura de organizar tus eventos y celebraciones 🎉</p>
            </div>

            <div className="fiesti-form-container">
                <div className="fiesti-form-card">
                    <h2 className="fiesti-form-title">Crear contraseña nueva</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="fiesti-form-group">
                            <label htmlFor="newPassword">Contraseña nueva</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                                className={getNewPasswordClassName()}
                                required
                            />
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

                        <div className="fiesti-form-group">
                            <label htmlFor="confirmPassword">Confirmar contraseña</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                className={getConfirmPasswordClassName()}
                                required
                            />
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