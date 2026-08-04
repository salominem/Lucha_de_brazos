import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import Swal from 'sweetalert2';
import { Upload, Image as ImageIcon, QrCode, Trash2, X } from 'lucide-react';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Estado para el modal de vista previa

  const backendUrl = 'http://localhost:5000';
  const currentAppUrl = window.location.href;

  const fetchImages = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/images`);
      setImages(res.data);
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      return Swal.fire('Atención', 'Selecciona una foto primero', 'warning');
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);

    try {
      await axios.post(`${backendUrl}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      Swal.fire('¡Éxito!', 'Tu foto ha sido subida a la galería 🚀', 'success');
      setFile(null);
      e.target.reset(); // Limpia el input de archivo
      fetchImages();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo subir la imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Función para eliminar imagen
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Evita abrir la imagen en grande al presionar borrar

    const result = await Swal.fire({
      title: '¿Eliminar imagen?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendUrl}/api/images/${id}`);
        Swal.fire('Borrada', 'La foto fue eliminada.', 'success');
        fetchImages();
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo borrar la foto', 'error');
      }
    }
  };

  return (
    <div className="container">
      <h1 className="header-title">📸 Galería interactiva QR</h1>

      {/* Tarjeta del Código QR */}
      <div className="card">
        <h3><QrCode size={20} /> Escanea para compartir</h3>
        <p className="subtitle">
          Escanea este QR desde cualquier celular para subir tus fotos del evento.
        </p>
        <div className="qr-container">
          <QRCodeSVG value={currentAppUrl} size={150} />
        </div>
      </div>

      {/* Tarjeta de Formulario */}
      <div className="card">
        <h3><Upload size={20} /> Subir una foto</h3>
        <form onSubmit={handleUpload}>
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="image/*"
              className="file-input"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button className="btn" type="submit" disabled={uploading}>
            {uploading ? 'Subiendo foto...' : 'Publicar Foto'}
          </button>
        </form>
      </div>

      {/* Tarjeta de Galería */}
      <div className="card">
        <h3>
          <ImageIcon size={20} /> Fotos subidas 
          <span className="badge">{images.length}</span>
        </h3>
        {images.length === 0 ? (
          <p className="empty-state">Aún no hay fotos. ¡Sé el primero en subir una!</p>
        ) : (
          <div className="gallery-grid">
            {images.map((img) => (
              <div 
                key={img._id} 
                className="gallery-item"
                onClick={() => setSelectedImage(img.imageUrl)}
              >
                <img src={img.imageUrl} alt="Evento" />
                <button 
                  className="delete-btn" 
                  title="Eliminar foto"
                  onClick={(e) => handleDelete(img._id, e)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE VISTA PREVIA EN PANTALLA COMPLETA */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedImage(null)}>
              <X size={24} />
            </button>
            <img src={selectedImage} alt="Foto ampliada" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;