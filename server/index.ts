
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { getDB } from './database';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors() as any);
// Increased limit to 50mb for database imports
app.use(express.json({ limit: '50mb' }) as any);
app.use('/api', routes);

export const startServer = async () => {
  try {
    await getDB();
    return new Promise<void>((resolve) => {
      app.listen(PORT, () => {
        console.log(`Express server internal: http://localhost:${PORT}`);
        resolve();
      });
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    throw err;
  }
};

if (typeof require !== 'undefined' && (require as any).main === (module as any)) {
    startServer();
}
