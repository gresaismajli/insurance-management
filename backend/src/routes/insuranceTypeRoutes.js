const express = require('express');
const { body, param } = require('express-validator');

const insuranceTypeController = require('../controllers/insuranceTypeController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Insurance type id must be a positive number')
];

const insuranceTypeValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional({ nullable: true }).trim(),
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be true or false')
];

router.use(authenticate);

router.get('/', insuranceTypeController.getInsuranceTypes);
router.get('/:id', idValidation, insuranceTypeController.getInsuranceTypeById);
router.post('/', insuranceTypeValidation, insuranceTypeController.createInsuranceType);
router.put(
  '/:id',
  [...idValidation, ...insuranceTypeValidation],
  insuranceTypeController.updateInsuranceType
);
router.delete('/:id', idValidation, insuranceTypeController.deleteInsuranceType);

module.exports = router;

