const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const logRoutes = require('./routes/logRoutes');
const orgRoutes = require('./routes/orgRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const allowedOrigins = env.frontendUrl
  ? env.frontendUrl
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true
  })
);
app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 250,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'TaskSphere API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
