import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Camera,
  MessageCircle,
  Trophy,
  X,
  QrCode,
  Download,
  MapPin,
  Clock,
  Mail,
  Globe,
  Share2,
  Trash2,
  Shield,
  Newspaper,
  Image as ImageIcon
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './App.css';

function App() {
  const [photos, setPhotos] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [file, setFile] = useState(null);
  const [uploaderName, setUploaderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados de Admin y Noticias
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsFile, setNewsFile] = useState(null);

  const qrRef = useRef();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const eventBannerUrl = "/luchadebrazos.jpg";

  const whatsappNumber = "5493812170571";
  const whatsappMessage = encodeURIComponent("¡Hola! Quisiera más información sobre el evento de Lucha de Brazos 💪");

  const fetchPhotos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/photos');
      setPhotos(res.data || []);
    } catch (err) {
      console.error("Error al cargar fotos:", err);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/news');
      setNewsList(res.data || []);
    } catch (err) {
      console.error("Error al cargar noticias:", err);
    }
  };

  useEffect(() => {
    fetchPhotos();
    fetchNews();
  }, []);

  // Animación al hacer scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [photos, newsList, isAdmin]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Por favor selecciona una imagen');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploaderName', uploaderName || 'Invitado');

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/photos/upload', formData);
      setFile(null);
      setUploaderName('');
      
      // Mostrar cartel de éxito
      setSuccessMessage('¡Foto subida correctamente! 🎉');
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);

      fetchPhotos();
    } catch (err) {
      alert('Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  // Login de Admin
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin123') { // Cambiá esta clave por la que prefieras
      setIsAdmin(true);
      setShowLoginModal(false);
      setAdminPassword('');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // Eliminar foto (Admin)
  const handleDeletePhoto = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que querés borrar esta foto?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/photos/${id}`);
      fetchPhotos();
    } catch (err) {
      alert('Error al eliminar la foto');
    }
  };

  // Crear noticia / flyer (Admin)
  const handleCreateNews = async (e) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return alert('Título y contenido son obligatorios');

    const formData = new FormData();
    formData.append('title', newsTitle);
    formData.append('content', newsContent);
    if (newsFile) formData.append('image', newsFile);

    try {
      await axios.post('http://localhost:5000/api/news', formData);
      setNewsTitle('');
      setNewsContent('');
      setNewsFile(null);
      fetchNews();
      alert('Noticia publicada con éxito');
    } catch (err) {
      alert('Error al publicar noticia');
    }
  };

  // Eliminar noticia (Admin)
  const handleDeleteNews = async (id) => {
    if (!window.confirm('¿Borrar esta noticia?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/news/${id}`);
      fetchNews();
    } catch (err) {
      alert('Error al borrar la noticia');
    }
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'QR_Lucha_De_Brazos.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="main-wrapper">
      <div className="container">
        {/* Encabezado con acceso Admin */}
        <header className="header header-flex">
  <div className="header-center">
    <h1> Lucha de Brazos</h1>
    <p>Galería Oficial del Evento</p>
  </div>

  <div className="admin-bar">
    {isAdmin ? (
      <span className="admin-badge">
        <Shield size={16} /> Modo Administrador
        <button onClick={() => setIsAdmin(false)} className="btn-logout">Salir</button>
      </span>
    ) : (
      <button onClick={() => setShowLoginModal(true)} className="btn-admin-access">
         Login
      </button>
    )}
  </div>
</header>

        {/* Banner del Evento */}
        <div className="event-banner-card">
          <img src={eventBannerUrl} alt="Banner del Evento" className="event-banner-img" />
          <div className="banner-overlay">
            <h3>¡Bienvenidos al Torneo Oficial!</h3>
            <p>Subí tus mejores tomas de las peleas y compartilas en la galería en vivo.</p>
          </div>
        </div>

        {/* Sección Panel Admin: Publicar Noticias/Flyers */}
        {isAdmin && (
          <div className="admin-panel-card reveal">
            <h3><Newspaper size={20} color="#e62e7b" /> Crear Nueva Noticia o Flyer</h3>
            <form onSubmit={handleCreateNews} className="admin-form">
              <input
                type="text"
                placeholder="Título de la noticia o aviso"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                className="name-input"
              />
              <textarea
                placeholder="Descripción / Detalle del evento o novedad..."
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                className="name-input textarea-input"
              />
              <div className="file-input-wrapper">
                <label><ImageIcon size={18} /> Adjuntar Imagen/Flyer (Opcional):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewsFile(e.target.files[0])}
                />
              </div>
              <button type="submit" className="btn-primary">Publicar Novedad 📢</button>
            </form>
          </div>
        )}

        {/* Sección de Noticias y Flyers */}
        {newsList.length > 0 && (
          <div className="news-section reveal">
            <h2 className="gallery-title">Novedades y Noticias</h2>
            <div className="news-grid">
              {newsList.map((item) => (
                <div key={item._id || item.id} className="news-card">
                  {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="news-img" />}
                  <div className="news-body">
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteNews(item._id || item.id)}
                        className="btn-delete"
                      >
                        <Trash2 size={16} /> Eliminar Noticia
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario de Subida de Fotos */}
        <div className="upload-card reveal">
          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-dropzone" onClick={() => document.getElementById('fileInput').click()}>
              <Camera size={40} color="#e62e7b" />
              <p style={{ marginTop: '10px' }}>
                {file ? file.name : "Tocá acá para sacar foto o subir de la galería"}
              </p>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </div>

            <input
              type="text"
              placeholder="Tu nombre (Opcional)"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              className="name-input"
            />

            {successMessage && (
              <div className="alert-success">
                {successMessage}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Subiendo...' : 'Publicar Foto'}
            </button>
          </form>
        </div>

        {/* Carrusel de Fotos */}
        <h2 className="gallery-title reveal">Fotos del Evento</h2>
        
        {photos.length === 0 ? (
          <p className="no-photos reveal" style={{ textAlign: 'center', color: '#a0a0ab', padding: '20px' }}>
            Aún no hay fotos. ¡Sé el primero en subir una!
          </p>
        ) : (
          <div className="carousel-container reveal">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="mySwiper"
            >
              {photos.map((photo) => (
                <SwiperSlide key={photo._id || photo.id}>
                  <div className="card" onClick={() => setSelectedImage(photo.imageUrl)}>
                    <img src={photo.imageUrl} alt="Foto del evento" />
                    <div className="card-info">
                      <p>📸 {photo.uploaderName || 'Invitado'}</p>
                    </div>
                    {isAdmin && (
                      <button
                        className="btn-delete-overlay"
                        onClick={(e) => handleDeletePhoto(photo._id || photo.id, e)}
                        title="Borrar Foto"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Tarjeta QR */}
        <div className="qr-card reveal">
          <div className="qr-header">
            <QrCode size={24} color="#e62e7b" />
            <h3>Código QR del Evento</h3>
          </div>
          <p>Escaneá para acceder o descargalo para imprimir:</p>
          
          <div className="qr-container" ref={qrRef}>
            {currentUrl && (
              <QRCodeCanvas
                value={currentUrl}
                size={180}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={true}
              />
            )}
          </div>

          <button onClick={downloadQR} className="btn-secondary">
            <Download size={18} /> Descargar QR Imprimible
          </button>
        </div>

        {/* Modal de Imagen Ampliada */}
        {selectedImage && (
          <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedImage(null)}>
                <X size={28} />
              </button>
              <img src={selectedImage} alt="Foto ampliada" />
            </div>
          </div>
        )}

        {/* Modal Login Admin */}
        {showLoginModal && (
          <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="admin-login-card" onClick={(e) => e.stopPropagation()}>
              <h3>Acceso Administrador</h3>
              <form onSubmit={handleAdminLogin}>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="name-input"
                  autoFocus
                />
                <div className="login-actions">
                  <button type="submit" className="btn-primary">Ingresar</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowLoginModal(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer reveal">
        <div className="footer-content">
          <div className="footer-section brand-col">
            <h2 className="footer-title"><Trophy size={22} color="#e62e7b" /> LUCHA DE BRAZOS</h2>
            <p className="footer-desc">
              El evento más grande de la disciplina. Viví la experiencia, compartí tus fotos en tiempo real y seguí cada enfrentamiento.
            </p>
            <div className="social-links">
              <a href="https://www.instagram.com/luchadebrazostuc/" target="_blank" rel="noopener noreferrer" title="Instagram">
                <Share2 size={18} /> Instagram
              </a>
              <a href="https://www.facebook.com/poly.chaileduranvazquez" target="_blank" rel="noopener noreferrer" title="Facebook">
                <Globe size={18} /> Facebook
              </a>
              <a href="mailto:contacto@luchadebrazos.com" title="Email">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3><Clock size={18} color="#e62e7b" /> Horarios</h3>
            <ul>
              <li>Apertura de Puertas: 16:00 hs</li>
              <li>Inicio Torneo: 18:00 hs</li>
              <li>Finales: 21:00 hs</li>
            </ul>
          </div>

          <div className="footer-section location-col">
            <h3><MapPin size={18} color="#e62e7b" /> Ubicación</h3>
            <p>Complejo Belgrano</p>
            <p className="address">Av. Saenz Peña 2100, Capital</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Lucha de Brazos. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Botón Flotante WhatsApp */}
      <a
  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
  className="whatsapp-float"
  target="_blank"
  rel="noopener noreferrer"
>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
  <span>Contacto</span>
</a>
    </div>
  );
}

export default App;