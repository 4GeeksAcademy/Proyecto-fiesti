import React, { useState } from "react";
import "../styles/festiactual.css";

const FestiActual = () => {
  const [imagenFestival, setImagenFestival] = useState(null);

  // Función para manejar la carga de imagen
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFestival(URL.createObjectURL(file));
    }
  };

  return (
    <div className="festi-container">
      <h1 className="festi-title">Festival Actual</h1>

      {/* Imagen del festival */}
      <div className="festi-img-section">
        <label className="festi-label">Cartel del Festival:</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImagenChange} 
          className="festi-input"
        />
        {imagenFestival && (
          <img 
            src={imagenFestival} 
            alt="Imagen del Festival" 
            className="festi-img"
          />
        )}
      </div>
    </div>
  );
};

export default FestiActual;
