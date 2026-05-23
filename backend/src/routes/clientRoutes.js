const express = require('express');
const { body, param } = require('express-validator');

const clientController = require('../controllers/clientController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Client id must be a positive number')
];

const clientValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('personalNumber')
    .trim()
    .notEmpty()
    .withMessage('Personal number is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required')
];

router.use(authenticate);

router.get('/', clientController.getClients);
router.get('/:id', idValidation, clientController.getClientById);
router.post('/', clientValidation, clientController.createClient);
router.put('/:id', [...idValidation, ...clientValidation], clientController.updateClient);
router.delete('/:id', idValidation, clientController.deleteClient);

module.exports = router;

