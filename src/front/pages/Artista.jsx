import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Artista = () => {
    const { theId: id } = useParams();
    const [actuacion, setActuacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchActuacion();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="loading-container">
                <p>Cargando actuación...</p>
            </div>
        );
    }

    if (error) {
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
                <h1>{actuacion.name}</h1>
                {actuacion.photo && (
                    <div className="artista-photo">
                        <img
                            src={actuacion.photo}
                            alt={actuacion.name}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="artista-content">
                <div className="artista-info">
                    <div className="info-section">
                        <h3>Descripción</h3>
                        <p>{actuacion.description}</p>
                    </div>

                    {actuacion.escenario && (
                        <div className="info-section">
                            <h3>Escenario</h3>
                            <p>{actuacion.escenario}</p>
                        </div>
                    )}

                    {(actuacion.horaInicio || actuacion.horaFin || actuacion.horario) && (
                        <div className="info-section">
                            <h3>Horarios</h3>
                            {actuacion.horario && <p><strong>Horario:</strong> {actuacion.horario}</p>}
                            {actuacion.horaInicio && <p><strong>Hora de inicio:</strong> {actuacion.horaInicio}</p>}
                            {actuacion.horaFin && <p><strong>Hora de fin:</strong> {actuacion.horaFin}</p>}
                        </div>
                    )}

                    {actuacion.num_personas && (
                        <div className="info-section">
                            <h3>Número de personas</h3>
                            <p>{actuacion.num_personas}</p>
                        </div>
                    )}

                    {actuacion.cache && (
                        <div className="info-section">
                            <h3>Caché</h3>
                            <p>{actuacion.cache.toFixed(2)} €</p>
                        </div>
                    )}

                    {actuacion.peticiones && (
                        <div className="info-section">
                            <h3>Peticiones especiales</h3>
                            <p>{actuacion.peticiones}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Artista;