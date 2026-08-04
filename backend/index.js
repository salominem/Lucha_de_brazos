require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Modelos de MongoDB
const Image = require('./models/Image');
const News = require('./models/News');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de almacenamiento en Cloudinary mediante Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'galeria_qr',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado con éxito a MongoDB'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err));

// ==========================================
// 📸 RUTAS DE FOTOS DE LA GALERÍA
// ==========================================

// 1. Obtener todas las imágenes
app.get('/api/photos', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las imágenes' });
  }
});

// 2. Subir una nueva imagen
app.post('/api/photos/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    const { uploaderName } = req.body;

    const newImage = new Image({ 
      imageUrl: req.file.path,
      uploaderName: uploaderName || 'Invitado'
    });
    
    await newImage.save();

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ error: 'Error al guardar la imagen' });
  }
});

// 3. Eliminar una imagen por ID
app.delete('/api/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Image.findByIdAndDelete(id);
    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al borrar la imagen:', error);
    res.status(500).json({ error: 'Error al borrar la imagen' });
  }
});

// ==========================================
// 📰 RUTAS DE NOTICIAS Y FLYERS
// ==========================================

// 1. Obtener todas las noticias/flyers
app.get('/api/news', async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 });
    res.json(newsList);
  } catch (error) {
    console.error('Error al obtener noticias:', error);
    res.status(500).json({ error: 'Error al obtener noticias' });
  }
});

// 2. Crear una nueva noticia o flyer (con o sin imagen)
app.post('/api/news', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'El título y el contenido son requeridos' });
    }

    // Si el usuario adjuntó una imagen, req.file.path contiene la URL de Cloudinary
    const imageUrl = req.file ? req.file.path : null;

    const newNews = new News({
      title,
      content,
      imageUrl
    });

    await newNews.save();
    res.status(201).json(newNews);
  } catch (error) {
    console.error('Error al publicar noticia:', error);
    res.status(500).json({ error: 'Error al guardar la noticia' });
  }
});

// 3. Eliminar una noticia o flyer por ID
app.delete('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await News.findByIdAndDelete(id);
    res.json({ message: 'Noticia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar noticia:', error);
    res.status(500).json({ error: 'Error al eliminar la noticia' });
  }
});

// Inicio del Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`));