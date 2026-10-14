

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand
} = require('@aws-sdk/client-s3');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
const PORT = process.env.PORT || 3000;
const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.AWS_REGION || 'us-east-1';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

// El SDK utiliza las credenciales configuradas en AWS CLI.
// No guardes claves de AWS en el código ni en el frontend.
const s3 = new S3Client({
  region: REGION
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Comprobar configuración
if (!BUCKET) {
  console.error('Falta configurar S3_BUCKET en el archivo .env');
  process.exit(1);
}

// Generar URL temporal para subir una imagen
app.post('/api/upload-url', async (req, res) => {
  try {
    const { filename, contentType, sizeBytes } = req.body || {};

    if (typeof filename !== 'string' || !filename.trim()) {
      return res.status(400).json({
        error: 'Nombre de archivo inválido'
      });
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(400).json({
        error: 'Solo se permiten imágenes JPG, PNG y WEBP'
      });
    }

    if (
      !Number.isInteger(sizeBytes) ||
      sizeBytes <= 0 ||
      sizeBytes >= MAX_SIZE
    ) {
      return res.status(400).json({
        error: 'La imagen debe pesar menos de 5 MB'
      });
    }

    const safeName = path.basename(filename)
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    const key =
      `originales/${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${safeName}`;

    // El Content-Type debe coincidir con el encabezado del PUT del navegador.
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300
    });

    return res.status(200).json({
      uploadUrl,
      key,
      expiresIn: 300
    });
  } catch (error) {
    console.error('Error al generar URL de subida:', error);

    return res.status(500).json({
      error: 'No se pudo generar la URL de subida'
    });
  }
});

// Listar imágenes con URLs temporales de visualización
app.get('/api/images', async (req, res) => {
  try {
    const result = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: 'originales/'
      })
    );

    const images = await Promise.all(
      (result.Contents || [])
        .filter(obj => obj.Size > 0)
        .map(async obj => {
          const url = await getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: BUCKET,
              Key: obj.Key
            }),
            { expiresIn: 900 }
          );

          return {
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
            url
          };
        })
    );

    return res.status(200).json(images);
  } catch (error) {
    console.error('Error al listar imágenes:', error);

    return res.status(500).json({
      error: 'No se pudieron listar las imágenes'
    });
  }
});

// Eliminar una imagen
app.delete('/api/images', async (req, res) => {
  try {
    const { key } = req.body || {};

    if (
      typeof key !== 'string' ||
      !key.startsWith('originales/') ||
      key.length <= 'originales/'.length ||
      key.includes('..')
    ) {
      return res.status(400).json({
        error: 'Clave de imagen inválida'
      });
    }

    await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET,
        Key: key
      })
    );

    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key
      })
    );

    return res.status(200).json({
      deleted: true,
      message: 'Imagen eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);

    if (
      error.name === 'NotFound' ||
      error.$metadata?.httpStatusCode === 404
    ) {
      return res.status(404).json({
        error: 'La imagen no existe'
      });
    }

    return res.status(500).json({
      error: 'No se pudo eliminar la imagen'
    });
  }
});

app.listen(PORT, () => {
  console.log(`API disponible en http://localhost:${PORT}`);
});
