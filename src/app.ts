import express from 'express';
import cors from 'cors';
import routes from './routes';
import tgsRoutes from './routes/tgs.routes';
import elitRoutes from './routes/elit.routes';


const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

// ✅ RUTAS NUEVAS MODULARES
// Montamos todas las rutas bajo el prefijo /api para alinearnos con el frontend.
app.use('/api', routes);
app.use('/api', tgsRoutes);
app.use('/api', elitRoutes);

// Health check con prefijo /api
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'DISTRIS_TGS_API' });
});

export default app;
