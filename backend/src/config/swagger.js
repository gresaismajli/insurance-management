const swaggerJsdoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Insurance Management API',
      version: '1.0.0',
      description:
        'REST API documentation for the Insurance Management System university project.'
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'gresa@test.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', example: 'Gresa Ismajli' },
            email: { type: 'string', example: 'gresa@test.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        Client: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'Arta' },
            lastName: { type: 'string', example: 'Berisha' },
            email: { type: 'string', example: 'arta@example.com' },
            phone: { type: 'string', example: '+38344111222' },
            personalNumber: { type: 'string', example: '1234567890' },
            address: { type: 'string', example: 'Main Street 10' },
            city: { type: 'string', example: 'Prishtina' }
          }
        },
        InsuranceType: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Travel Insurance' },
            description: { type: 'string', example: 'Coverage for travel risks.' },
            basePrice: { type: 'number', example: 80 },
            isActive: { type: 'boolean', example: true }
          }
        },
        Policy: {
          type: 'object',
          properties: {
            clientId: { type: 'integer', example: 1 },
            insuranceTypeId: { type: 'integer', example: 2 },
            policyNumber: { type: 'string', example: 'POL-001' },
            startDate: { type: 'string', format: 'date', example: '2026-01-01' },
            endDate: { type: 'string', format: 'date', example: '2026-12-31' },
            premiumAmount: { type: 'number', example: 250 },
            coverageAmount: { type: 'number', example: 10000 },
            status: { type: 'string', example: 'active' }
          }
        },
        Claim: {
          type: 'object',
          properties: {
            policyId: { type: 'integer', example: 1 },
            claimNumber: { type: 'string', example: 'CLM-001' },
            claimDate: { type: 'string', format: 'date', example: '2026-02-10' },
            description: { type: 'string', example: 'Accident claim' },
            requestedAmount: { type: 'number', example: 1200 },
            approvedAmount: { type: 'number', nullable: true, example: null },
            status: { type: 'string', example: 'submitted' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            policyId: { type: 'integer', example: 1 },
            paymentDate: { type: 'string', format: 'date', example: '2026-03-01' },
            amount: { type: 'number', example: 250 },
            method: { type: 'string', example: 'bank_transfer' },
            status: { type: 'string', example: 'completed' },
            referenceNumber: { type: 'string', nullable: true, example: 'PAY-001' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          security: [],
          summary: 'Check API health',
          responses: {
            200: { description: 'API is running' }
          }
        }
      },
      '/database/health': {
        get: {
          tags: ['Health'],
          security: [],
          summary: 'Check database connection',
          responses: {
            200: { description: 'Database is connected' }
          }
        }
      },
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          security: [],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' }
              }
            }
          },
          responses: {
            201: { description: 'User registered successfully' },
            409: { description: 'Email already registered' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          security: [],
          summary: 'Login and receive tokens',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' }
              }
            }
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' }
          }
        }
      },
      '/auth/refresh': {
        post: {
          tags: ['Authentication'],
          security: [],
          summary: 'Refresh access token',
          responses: {
            200: { description: 'New access token returned' },
            401: { description: 'Invalid refresh token' }
          }
        }
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          security: [],
          summary: 'Logout and revoke refresh token',
          responses: {
            200: { description: 'Logged out successfully' }
          }
        }
      },
      '/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current authenticated user',
          responses: {
            200: { description: 'Current user returned' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/dashboard/summary': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get dashboard statistics and recent activity',
          responses: {
            200: { description: 'Dashboard summary returned' }
          }
        }
      },
      '/clients': {
        get: {
          tags: ['Clients'],
          summary: 'List or search clients',
          parameters: [
            { name: 'search', in: 'query', required: false, schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'Clients returned' } }
        },
        post: {
          tags: ['Clients'],
          summary: 'Create client',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Client' }
              }
            }
          },
          responses: { 201: { description: 'Client created' } }
        }
      },
      '/clients/{id}': {
        get: {
          tags: ['Clients'],
          summary: 'Get client by id',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Client returned' } }
        },
        put: {
          tags: ['Clients'],
          summary: 'Update client',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Client updated' } }
        },
        delete: {
          tags: ['Clients'],
          summary: 'Delete client, admin only',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Client deleted' } }
        }
      },
      '/insurance-types': {
        get: {
          tags: ['Insurance Types'],
          summary: 'List or search insurance types',
          responses: { 200: { description: 'Insurance types returned' } }
        },
        post: {
          tags: ['Insurance Types'],
          summary: 'Create insurance type, admin only',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/InsuranceType' }
              }
            }
          },
          responses: { 201: { description: 'Insurance type created' } }
        }
      },
      '/policies': {
        get: {
          tags: ['Policies'],
          summary: 'List/search/filter policies',
          responses: { 200: { description: 'Policies returned' } }
        },
        post: {
          tags: ['Policies'],
          summary: 'Create policy',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Policy' }
              }
            }
          },
          responses: { 201: { description: 'Policy created' } }
        }
      },
      '/claims': {
        get: {
          tags: ['Claims'],
          summary: 'List/search/filter claims',
          responses: { 200: { description: 'Claims returned' } }
        },
        post: {
          tags: ['Claims'],
          summary: 'Create claim',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Claim' }
              }
            }
          },
          responses: { 201: { description: 'Claim created' } }
        }
      },
      '/payments': {
        get: {
          tags: ['Payments'],
          summary: 'List/search/filter payments',
          responses: { 200: { description: 'Payments returned' } }
        },
        post: {
          tags: ['Payments'],
          summary: 'Create payment',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Payment' }
              }
            }
          },
          responses: { 201: { description: 'Payment created' } }
        }
      }
    }
  },
  apis: []
});

module.exports = swaggerSpec;

