import express from 'express';
import * as dotenv from 'dotenv';
import router from './routes';

dotenv.config();

const app = express();
app.use(express.json());

// Mount all API routes under the root path.
app.use(router);

// Determine port from environment or default to 3000.
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
