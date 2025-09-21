import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from '#routes/auth.routes.js';

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: { write: msg => logger.info(msg.trim()) },
  })
);

app.get('/', (req, res) => {
  logger.info('Hello From Logger');
  res.status(200).send('Hello World!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Welcome to the API' });
});

app.use('/api/auth', authRoutes);
export default app;
