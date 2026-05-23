const express = require('express');
const { body, param } = require('express-validator');

const policyController = require('../controllers/policyController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Policy id must be a positive number')
];

const policyValidation = [
  body('clientId').isInt({ min: 1 }).withMessage('Client id is required'),
  body('insuranceTypeId')
    .isInt({ min: 1 })
    .withMessage('Insurance type id is required'),
  body('policyNumber').trim().notEmpty().withMessage('Policy number is required'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }

      return true;
    }),
  body('premiumAmount')
    .isFloat({ min: 0 })
    .withMessage('Premium amount must be a positive number'),
  body('coverageAmount')
    .isFloat({ min: 0 })
    .withMessage('Coverage amount must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'expired', 'cancelled'])
    .withMessage('Status must be active, expired, or cancelled')
];

router.use(authenticate);

router.get('/', policyController.getPolicies);
router.get('/:id', idValidation, policyController.getPolicyById);
router.post('/', policyValidation, policyController.createPolicy);
router.put('/:id', [...idValidation, ...policyValidation], policyController.updatePolicy);
router.delete('/:id', idValidation, policyController.deletePolicy);

module.exports = router;

