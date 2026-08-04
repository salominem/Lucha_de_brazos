require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Image = require('./models/Image');

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

// --- RUTAS DE LA API ---

// 1. Obtener todas las imágenes para la galería
app.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las imágenes' });
  }
});

// 2. Subir una nueva imagen
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    const newImage = new Image({ imageUrl: req.file.path });
    await newImage.save();

    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la imagen' });
  }
});

const PORT = process.env.PORT || 5000;

// Endpoint para eliminar una imagen por su ID
app.delete('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Image.findByIdAndDelete(id);
    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al borrar la imagen:', error);
    res.status(500).json({ error: 'Error al borrar la imagen' });
  }
});

app.listen(PORT, () => console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`));