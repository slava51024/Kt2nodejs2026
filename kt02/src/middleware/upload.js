const fs = require('fs');
const multer = require('multer');
const { uploadDir, maxFileSize } = require('../config');

fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME[file.mimetype];
    cb(null, `product-${req.params.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME[file.mimetype]) return cb(null, true);
  const err = new Error('Допустимы только изображения JPEG и PNG');
  err.status = 400;
  cb(err);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize, files: 1 },
});

module.exports = upload;
