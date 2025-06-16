
require('dotenv').config(); // Carga las variables desde .env al inicio
const express = require('express');
const cors =require('cors');
const multer = require('multer');
const path = require('path');
const fs =require('fs'); // File System module
const ftp = require('basic-ftp');

const app = express();
const port = process.env.PORT || 3000;

// --- FTP Configuration (desde variables de entorno) ---
const ftpConfig = {
  host: process.env.FTP_HOST,
  port: parseInt(process.env.FTP_PORT || '21', 10),
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: process.env.FTP_SECURE === 'true' || process.env.FTP_SECURE === 'implicit',
  secureOptions: process.env.FTP_SECURE_REJECT_UNAUTHORIZED === 'false' ? { rejectUnauthorized: false } : undefined,
};

// --- CORS Configuration ---
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:9002,https://truevintageperu.com').split(',');
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origen '${origin}' bloqueado.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'POST',
};
app.use(cors(corsOptions));

// --- Multer Configuration (para guardar temporalmente el archivo localmente) ---
const LOCAL_TEMP_UPLOAD_DIR = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(LOCAL_TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_TEMP_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, LOCAL_TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const tempUniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, tempUniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// --- Helper para asegurar que la ruta remota exista en FTP ---
async function ensureRemotePathExistsFTP(client, remoteDirPath) {
  try {
    await client.ensureDir(remoteDirPath);
    console.log(`FTP: Directorio remoto ${remoteDirPath} asegurado/creado.`);
  } catch (err) {
    console.error(`FTP: Error al asegurar directorio remoto ${remoteDirPath}:`, err);
    throw err;
  }
}

// --- Endpoint para subida de imágenes ---
app.post('/api/process-image-upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    fs.unlinkSync(localFilePath).catch(err => console.error("Error eliminando archivo temporal tras no recibir archivo:", err));
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const localFilePath = req.file.path; // Definir aquí para acceso en caso de error temprano
  const { sku, dropName, prefijo, imageIndex, imageType } = req.body;

  if (!sku || sku.trim() === "") {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return res.status(400).json({ error: 'SKU is required' });
  }

  // imageIndex y imageType son ahora cruciales
  if (imageType !== 'color' && imageType !== 'bw') {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return res.status(400).json({ error: 'imageType debe ser "color" o "bw".' });
  }

  let imageNumberParsed;
  if (imageIndex !== undefined && imageIndex !== null) {
      imageNumberParsed = parseInt(imageIndex, 10);
      if (isNaN(imageNumberParsed)) {
          if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
          return res.status(400).json({ error: 'imageIndex debe ser un número si se proporciona.' });
      }
  } else {
    // imageIndex ahora es requerido para ambos tipos si se suben múltiples.
    // El frontend debería siempre enviarlo (0-based).
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return res.status(400).json({ error: 'imageIndex es requerido para imágenes.' });
  }

  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  let generatedFileName;
  // imageIndex es 0-based, para el nombre de archivo lo queremos 1-based
  const formattedImageNumber = (imageNumberParsed + 1).toString().padStart(2, '0');

  if (imageType === 'bw') {
    generatedFileName = `${sku.trim()}-bw${formattedImageNumber}${fileExtension}`;
  } else { // 'color'
    generatedFileName = `${sku.trim()}-img${formattedImageNumber}${fileExtension}`;
  }
  
  let remoteDirParts = [];
  if (dropName && dropName.trim() !== "") {
    remoteDirParts.push(dropName.trim());
  }
  if (prefijo && prefijo.trim() !== "") {
    remoteDirParts.push(prefijo.trim());
  }
  remoteDirParts.push(sku.trim());

  const ftpBaseImageDir = process.env.FTP_BASE_IMAGE_DIR || '/domains/truevintageperu.com/public_html/vtg'; // Usar variable de entorno si existe

  // Agregar "BW" al directorio si el tipo de imagen es "bw"
  if (imageType === 'bw') {
    remoteDirParts.splice(remoteDirParts.length - 1, 0, 'BW');
  }
  
  const remoteTargetDirectory = path.posix.join(ftpBaseImageDir, ...remoteDirParts);
  const remoteFilePath = path.posix.join(remoteTargetDirectory, generatedFileName);
  
  const urlPathSegment = [...remoteDirParts, generatedFileName].join('/');

  const client = new ftp.Client(process.env.FTP_VERBOSE === 'true' ? 0 : undefined); // 0 para timeout infinito si es verbose, sino default
  if (process.env.FTP_VERBOSE === 'true') {
      client.ftp.verbose = true; 
  }

  try {
    console.log(`FTP: Conectando a ${ftpConfig.host}:${ftpConfig.port}...`);
    await client.access(ftpConfig);
    console.log(`FTP: Conectado.`);

    console.log(`FTP: Asegurando que el directorio remoto exista: ${remoteTargetDirectory}`);
    await ensureRemotePathExistsFTP(client, remoteTargetDirectory);

    console.log(`FTP: Subiendo ${localFilePath} a ${remoteFilePath} (nombre: ${generatedFileName}, tipo: ${imageType}, index: ${imageIndex})`);
    await client.uploadFrom(localFilePath, remoteFilePath);
    console.log(`FTP: Subida exitosa.`);

    const baseImageUrl = process.env.BASE_IMAGE_URL || 'https://truevintageperu.com/vtg'; // Usar variable de entorno
    const imageUrl = `${baseImageUrl}/${urlPathSegment}`;
    
    res.status(200).json({ url: imageUrl, generatedFileName, imageType, imageIndex });

  } catch (err) {
    console.error('Error durante el proceso FTP:', err);
    res.status(500).json({ error: 'Fallo al subir imagen vía FTP.', details: err.message });
  } finally {
    if (!client.closed) {
        await client.close();
        console.log('FTP: Desconectado.');
    }
    if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        console.log(`Archivo temporal local eliminado: ${localFilePath}`);
    }
  }
});

app.get('/', (req, res) => {
  res.send('Servidor de subida de imágenes con FTP está corriendo.');
});

app.listen(port, () => {
  console.log(`Servidor de subida de imágenes FTP escuchando en http://localhost:${port}`);
  if (!ftpConfig.host || !ftpConfig.user || !ftpConfig.password) {
    console.warn("ADVERTENCIA: Las variables de entorno FTP (FTP_HOST, FTP_USER, FTP_PASSWORD) no están completamente configuradas.");
  }
  console.log(`CORS permitido para: ${allowedOrigins.join(', ')}`);
  console.log(`Directorio base para imágenes en FTP: ${process.env.FTP_BASE_IMAGE_DIR || '/domains/truevintageperu.com/public_html/vtg'}`);
  console.log(`URL base para imágenes: ${process.env.BASE_IMAGE_URL || 'https://truevintageperu.com/vtg'}`);
});
    