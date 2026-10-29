const Joi = require('joi');
const { categories } = require('../config');

const productFields = {
  name: Joi.string().trim().min(2).max(100),
  price: Joi.number().greater(0),
  category: Joi.string().valid(...categories),
  stock: Joi.number().integer().min(0),
  description: Joi.string().trim().max(500).allow(''),
};


const productSchema = Joi.object({
  name: productFields.name.required(),
  price: productFields.price.required(),
  category: productFields.category.required(),
  stock: productFields.stock.default(0),
  description: productFields.description,
});


const productPatchSchema = Joi.object(productFields).min(1);


const listQuerySchema = Joi.object({
  category: Joi.string().valid(...categories),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0).when('minPrice', {
    is: Joi.exist(),
    then: Joi.number().min(Joi.ref('minPrice')),
  }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});



 
 
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }

    req[source] = value;
    next();
  };
}

module.exports = { validate, productSchema, productPatchSchema, listQuerySchema };
