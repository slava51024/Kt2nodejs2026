const fs = require('fs');
const path = require('path');
const express = require('express');
const upload = require('../middleware/upload');
const {
  validate,
  productSchema,
  productPatchSchema,
  listQuerySchema,
} = require('../middleware/validate');
const { uploadDir } = require('../config');

const router = express.Router();


const products = [];
let nextId = 1;


function removeImageFile(imageUrl) {
  if (!imageUrl) return;
  const file = path.join(uploadDir, path.basename(imageUrl));
  fs.unlink(file, () => {});
}


router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'id должен быть положительным целым числом' });
  }
  const product = products.find((p) => p.id === Number(id));
  if (!product) {
    return res.status(404).json({ error: `Товар с id=${id} не найден` });
  }
  req.product = product;
  next();
});

// GET /api/products — список с фильтрацией и пагинацией
router.get('/', validate(listQuerySchema, 'query'), (req, res) => {
  const { category, minPrice, maxPrice, page, limit } = req.query;

  let result = products;
  if (category) result = result.filter((p) => p.category === category);
  if (minPrice !== undefined) result = result.filter((p) => p.price >= minPrice);
  if (maxPrice !== undefined) result = result.filter((p) => p.price <= maxPrice);

  const total = result.length;
  const start = (page - 1) * limit;

  res.json({
    data: result.slice(start, start + limit),
    total,
    page,
    limit,
  });
});

// GET /api/products/:id — один товар
router.get('/:id', (req, res) => {
  res.json(req.product);
});

// POST /api/products — создать товар
router.post('/', validate(productSchema), (req, res) => {
  const product = {
    id: nextId++,
    ...req.body,
    imageUrl: null,
    createdAt: new Date().toISOString(),
  };
  products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id — полная замена
router.put('/:id', validate(productSchema), (req, res) => {
  const { id, imageUrl, createdAt } = req.product;
  const updated = { id, ...req.body, imageUrl, createdAt };
  products[products.indexOf(req.product)] = updated;
  res.json(updated);
});

// PATCH /api/products/:id — частичное обновление
router.patch('/:id', validate(productPatchSchema), (req, res) => {
  Object.assign(req.product, req.body);
  res.json(req.product);
});

// DELETE /api/products/:id — удалить товар
router.delete('/:id', (req, res) => {
  removeImageFile(req.product.imageUrl);
  products.splice(products.indexOf(req.product), 1);
  res.status(204).send();
});

// POST /api/products/:id/image — загрузить изображение (поле формы "image")
router.post('/:id/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не передан (поле "image")' });
  }
  // Удаляем старое изображение, если было
  removeImageFile(req.product.imageUrl);
  req.product.imageUrl = `/uploads/products/${req.file.filename}`;
  res.json(req.product);
});

module.exports = router;
