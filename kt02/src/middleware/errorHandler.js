const multer = require('multer');

function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}


function errorHandler(err, req, res, next) {
 
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Размер файла превышает 2 МБ'
        : err.code === 'LIMIT_UNEXPECTED_FILE'
        ? 'Файл должен передаваться в поле "image"'
        : err.message;
    return res.status(400).json({ error: message });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некорректный JSON в теле запроса' });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    error: status >= 500 ? 'Internal Server Error' : err.message,
  });
}

module.exports = { notFound, errorHandler };
