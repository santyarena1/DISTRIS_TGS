// src/app.ts
import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// ✅ RUTAS NUEVAS MODULARES
app.use(routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'DISTRIS_TGS_API' });
});

export default app;
