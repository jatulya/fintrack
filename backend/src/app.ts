import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { accountsRouter } from './modules/accounts/accounts.routes.js';
import { categoriesRouter } from './modules/categories/categories.routes.js';
import { transactionsRouter } from './modules/transactions/transactions.routes.js';
import { recurringPaymentsRouter } from './modules/recurring-payments/recurring-payments.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: env.isProduction ? undefined : false,
  }));

  app.use(cors({
    origin: env.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.get(`${env.apiBasePath}/health`, (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(`${env.apiBasePath}/auth`, authRouter);
  app.use(`${env.apiBasePath}/accounts`, accountsRouter);
  app.use(`${env.apiBasePath}/categories`, categoriesRouter);
  app.use(`${env.apiBasePath}/transactions`, transactionsRouter);
  app.use(`${env.apiBasePath}/recurring-payments`, recurringPaymentsRouter);
  app.use(`${env.apiBasePath}/dashboard`, dashboardRouter);

  app.use(errorHandler);

  return app;
}
