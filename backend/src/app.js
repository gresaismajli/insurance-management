const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const claimRoutes = require('./routes/claimRoutes');
const clientRoutes = require('./routes/clientRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const insuranceTypeRoutes = require('./routes/insuranceTypeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const policyRoutes = require('./routes/policyRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/insurance-types', insuranceTypeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api', databaseRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'insurance-management-api'
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    message: 'Internal server error'
  });
});

module.exports = app;
