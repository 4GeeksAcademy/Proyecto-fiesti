import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "../styles/artista.css";

const Artista = () => {
    const { theId: id } = useParams();
    const [actuacion, setActuacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        photo: '',
        escenario: '',
        horario: '',
        num_personas: '',
        cache: '',
        peticiones: ''
    });

    // Estado de edición por campo
    const [editingField, setEditingField] = useState(null);

    useEffect(() => {
        const fetchActuacion = async () => {
            try {
                setLoading(true);
                const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/actuaciones/${id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Actuación no encontrada');
                    }
                    throw new Error('Error al cargar la actuación');
                }

                const data = await response.json();
                setActuacion(data);

                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    photo: data.photo || '',
                    escenario: data.escenario || '',
                    horario: data.horario || '',
                    num_personas: data.num_personas ? data.num_personas.toString() : '',
                    cache: data.cache ? data.cache.toString() : '',
                    peticiones: data.peticiones || ''
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchActuacion();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveField = async (field) => {
        setSaving(true);
        setError(null);

        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('Token de autenticación no encontrado');
            }

            const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/actuaciones/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ [field]: formData[field] })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.msg || 'Error al actualizar la actuación');
            }

            setActuacion(result.actuacion);
            setEditingField(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelField = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: actuacion[field] || ''
        }));
        setEditingField(null);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <p>Cargando actuación...</p>
            </div>
        );
    }

    if (error && !actuacion) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!actuacion) {
        return (
            <div className="not-found-container">
                <h2>Actuación no encontrada</h2>
            </div>
        );
    }

    return (
        <div className="artista-container">
            <div className="artista-header">
                <h1>Detalles actuación</h1>
                <div className="header-content">
                    
                    {/* Nombre */}
                    {editingField === "name" ? (
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSaveField("name");
                                }
                            }}
                            autoFocus
                            className="edit-input"
                        />
                    ) : (
                        <h1>
                            {actuacion.name}
                            <i
                                className="fa-regular fa-pen-to-square"
                                style={{ marginLeft: "10px", cursor: "pointer" }}
                                onClick={() => setEditingField("name")}
                            />
                        </h1>
                    )}
                </div>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                <div className="artista-content">
                    <div className="artista-info">

                        {/* Descripción */}
                        <div className="info-section">
                            <h3>Descripción</h3>
                            {editingField === "description" ? (
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault(); // evita salto de línea
                                            handleSaveField("description");
                                        }
                                    }}
                                    autoFocus
                                    className="edit-input"
                                    rows="4"
                                />
                            ) : (
                                <p>
                                    {actuacion.description}
                                    <i
                                        className="fa-regular fa-pen-to-square"
                                        style={{ marginLeft: "10px", cursor: "pointer" }}
                                        onClick={() => setEditingField("description")}
                                    />
                                </p>
                            )}
                        </div>

                        {/* Escenario */}
                        <div className="info-section">
                            <h3>Escenario</h3>
                            {editingField === "escenario" ? (
                                <input
                                    type="text"
                                    name="escenario"
                                    value={formData.escenario}
                                    onChange={handleChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSaveField("escenario");
                                        }
                                    }}
                                    autoFocus
                                    className="edit-input"
                                />
                            ) : (
                                <p>
                                    {actuacion.escenario || "No especificado"}
                                    <i
                                        className="fa-regular fa-pen-to-square"
                                        style={{ marginLeft: "10px", cursor: "pointer" }}
                                        onClick={() => setEditingField("escenario")}
                                    />
                                </p>
                            )}

                        </div>

                        {/* Horario */}
                        <div className="info-section">
                            <h3>Horario</h3>
                            {editingField === "horario" ? (
                                <input
                                    type="text"
                                    name="horario"
                                    value={formData.horario}
                                    onChange={handleChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSaveField("horario");
                                        }
                                    }}
                                    autoFocus
                                    placeholder="ej: 20:00-22:00"
                                    className="edit-input"
                                />
                            ) : (
                                <p>
                                    {actuacion.horario || "No especificado"}
                                    <i
                                        className="fa-regular fa-pen-to-square"
                                        style={{ marginLeft: "10px", cursor: "pointer" }}
                                        onClick={() => setEditingField("horario")}
                                    />
                                </p>
                            )}
                        </div>

                        {/* Número de personas */}
                        <div className="info-section">
                            <h3>Número de personas</h3>
                            {editingField === "num_personas" ? (
                                <input
                                    type="number"
                                    name="num_personas"
                                    value={formData.num_personas}
                                    onChange={handleChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSaveField("num_personas");
                                        }
                                    }}
                                    autoFocus
                                    min="1"
                                    className="edit-input"
                                />
                            ) : (
                                <p>
                                    {actuacion.num_personas || "No especificado"}
                                    <i
                                        className="fa-regular fa-pen-to-square"
                                        style={{ marginLeft: "10px", cursor: "pointer" }}
                                        onClick={() => setEditingField("num_personas")}
                                    />
                                </p>
                            )}
                        </div>

                        {/* Caché */}
                        <div className="info-section">
                            <h3>Caché</h3>
                            {editingField === "cache" ? (
                                <input
                                    type="number"
                                    name="cache"
                                    value={formData.cache}
                                    onChange={handleChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSaveField("cache");
                                        }
                                    }}
                                    autoFocus
                                    min="0"
                                    step="0.01"
                                    className="edit-input"
                                />
                            ) : (
                                <p>
                                    {actuacion.cache ? `${actuacion.cache.toFixed(2)} €` : "No especificado"}
                                    <i
                                        className="fa-regular fa-pen-to-square"
                                        style={{ marginLeft: "10px", cursor: "pointer" }}
                                        onClick={() => setEditingField("cache")}
                                    />
                                </p>
                            )}
                        </div>

                        {/* Peticiones */}
                        <div className="info-section">
                            <h3>Peticiones especiales</h3>
                            {editingField === "peticiones" ? (
                                <input
                                    type="text"
                                    name="peticiones"
                                    value={formData.peticiones}
                                    onChange={handleChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSaveField("peticiones");
                                        }
                                    }}
                                    autoFocus
                                    className="edit-input"
                                />
                            ) : (
                                <p>
                                    {actuacion.peticiones || "Ninguna"}
                                    <i
                                        className="fa-regular fa-pen-to-square"
                                        style={{ marginLeft: "10px", cursor: "pointer" }}
                                        onClick={() => setEditingField("peticiones")}
                                    />
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Artista;
