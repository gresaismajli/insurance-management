const express = require('express');
const { body, param } = require('express-validator');

const claimController = require('../controllers/claimController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Claim id must be a positive number')
];

const claimValidation = [
  body('policyId').isInt({ min: 1 }).withMessage('Policy id is required'),
  body('claimNumber').trim().notEmpty().withMessage('Claim number is required'),
  body('claimDate').isISO8601().withMessage('Claim date must be a valid date'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('requestedAmount')
    .isFloat({ min: 0 })
    .withMessage('Requested amount must be a positive number'),
  body('approvedAmount')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Approved amount must be a positive number'),
  body('status')
    .optional()
    .isIn(['submitted', 'reviewing', 'approved', 'rejected', 'paid'])
    .withMessage('Status must be submitted, reviewing, approved, rejected, or paid')
];

router.use(authenticate);

router.get('/', claimController.getClaims);
router.get('/:id', idValidation, claimController.getClaimById);
router.post('/', authorizeRoles('admin', 'agent'), claimValidation, claimController.createClaim);
router.put(
  '/:id',
  authorizeRoles('admin', 'agent'),
  [...idValidation, ...claimValidation],
  claimController.updateClaim
);
router.delete('/:id', authorizeRoles('admin'), idValidation, claimController.deleteClaim);

module.exports = router;
