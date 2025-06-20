require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const db = require('./models');
const routes = require('./routes');
const logger = require('./utils/logger');
const socketHandler = require('./socket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Setlist Builder API',
      version: '1.0.0',
      description: 'API for the Setlist Builder + Sync application',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Socket.io
socketHandler(io);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  try {
    await db.sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
});