// src/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

// 👉 CORS: por ahora dejamos todo abierto mientras desarrollás
app.use(
  cors({
    origin: '*', // si querés, después lo limitamos a ['http://localhost:60561']
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Para parsear JSON
app.use(express.json());

// Tus rutas
app.use(routes);

// Puerto configurable
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
