
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { getDB } from './database';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors() as any);
// Increased limit for database file uploads
app.use(express.json({ limit: '10mb' }) as any);

// Routes
app.use('/api', routes);

// Initialize DB and start server
getDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database initialized at db/ledgerly.db`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
