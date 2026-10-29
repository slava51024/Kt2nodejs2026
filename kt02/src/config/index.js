const path = require('path');
require('dotenv').config();

const rootDir = path.resolve(__dirname, '..', '..');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  rootDir,
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || 'uploads/products'),
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024, // 2 МБ
  categories: ['electronics', 'clothing', 'food', 'other'],
};
