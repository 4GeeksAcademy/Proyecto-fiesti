import React, { useState } from 'react';

const CloudinaryUploader = ({ 
  onUpload,          // callback que devuelve la URL al padre
  className,         // clase para el botón
  label = "Subir imagen", // texto por defecto del botón
  children           // opcional: contenido del botón (ícono, etc.)
}) => {
  const preset_name = "Cloudinary Fiesti";
  const cloud_name = "dlpcapb73";

  const [loading, setLoading] = useState(false);

  const uploadImage = async (e) => {
    const files = e.target.files;
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", preset_name);

    setLoading(true);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
        method: "POST",
        body: data,
      });

      const file = await response.json();
      setLoading(false);

      if (onUpload) onUpload(file.secure_url); // enviamos la URL al componente padre
    } catch (error) {
      console.error("Error uploading image:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      {/* input oculto */}
      <input
        type="file"
        id="cloudinaryFileInput"
        style={{ display: "none" }}
        onChange={uploadImage}
      />

      {/* botón con estilo customizable */}
      <button
        type="button"
        className={className}
        onClick={() => document.getElementById("cloudinaryFileInput").click()}
      >
        {children || label}
      </button>

      {loading && <p>Subiendo imagen...</p>}
    </div>
  );
};

export default CloudinaryUploader;
