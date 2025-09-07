import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
                <div className="header-content">
                    {editingField === "name" ? (
                        <div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={saving}
                                className="edit-title"
                            />
                            <button onClick={() => handleSaveField("name")} disabled={saving}>
                                {saving ? "Guardando..." : "Guardar"}
                            </button>
                            <button onClick={() => handleCancelField("name")} disabled={saving}>
                                Cancelar
                            </button>
                        </div>
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
                            <div>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    disabled={saving}
                                    rows="4"
                                />
                                <button onClick={() => handleSaveField("description")} disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar"}
                                </button>
                                <button onClick={() => handleCancelField("description")} disabled={saving}>
                                    Cancelar
                                </button>
                            </div>
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
                            <div>
                                <input
                                    type="text"
                                    name="escenario"
                                    value={formData.escenario}
                                    onChange={handleChange}
                                    disabled={saving}
                                />
                                <button onClick={() => handleSaveField("escenario")} disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar"}
                                </button>
                                <button onClick={() => handleCancelField("escenario")} disabled={saving}>
                                    Cancelar
                                </button>
                            </div>
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
                            <div>
                                <input
                                    type="text"
                                    name="horario"
                                    value={formData.horario}
                                    onChange={handleChange}
                                    disabled={saving}
                                    placeholder="ej: 20:00-22:00"
                                />
                                <button onClick={() => handleSaveField("horario")} disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar"}
                                </button>
                                <button onClick={() => handleCancelField("horario")} disabled={saving}>
                                    Cancelar
                                </button>
                            </div>
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
                            <div>
                                <input
                                    type="number"
                                    name="num_personas"
                                    value={formData.num_personas}
                                    onChange={handleChange}
                                    disabled={saving}
                                    min="1"
                                />
                                <button onClick={() => handleSaveField("num_personas")} disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar"}
                                </button>
                                <button onClick={() => handleCancelField("num_personas")} disabled={saving}>
                                    Cancelar
                                </button>
                            </div>
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
                            <div>
                                <input
                                    type="number"
                                    name="cache"
                                    value={formData.cache}
                                    onChange={handleChange}
                                    disabled={saving}
                                    min="0"
                                    step="0.01"
                                />
                                <button onClick={() => handleSaveField("cache")} disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar"}
                                </button>
                                <button onClick={() => handleCancelField("cache")} disabled={saving}>
                                    Cancelar
                                </button>
                            </div>
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
                            <div>
                                <textarea
                                    name="peticiones"
                                    value={formData.peticiones}
                                    onChange={handleChange}
                                    disabled={saving}
                                    rows="3"
                                />
                                <button onClick={() => handleSaveField("peticiones")} disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar"}
                                </button>
                                <button onClick={() => handleCancelField("peticiones")} disabled={saving}>
                                    Cancelar
                                </button>
                            </div>
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
    );
};

export default Artista;
