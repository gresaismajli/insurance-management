const express = require('express');
const { body, param } = require('express-validator');

const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Payment id must be a positive number')
];

const paymentValidation = [
  body('policyId').isInt({ min: 1 }).withMessage('Policy id is required'),
  body('paymentDate')
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('method')
    .isIn(['cash', 'card', 'bank_transfer'])
    .withMessage('Method must be cash, card, or bank transfer'),
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed'])
    .withMessage('Status must be pending, completed, or failed'),
  body('referenceNumber')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage('Reference number must be 80 characters or less')
];

router.use(authenticate);

router.get('/', paymentController.getPayments);
router.get('/:id', idValidation, paymentController.getPaymentById);
router.post('/', paymentValidation, paymentController.createPayment);
router.put('/:id', [...idValidation, ...paymentValidation], paymentController.updatePayment);
router.delete('/:id', idValidation, paymentController.deletePayment);

module.exports = router;

