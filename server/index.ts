import express from 'express';
import cors from 'cors';
import routes from './routes';
import { getDB } from './database';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Initialize DB and start server
getDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database initialized at backend/db/ledgerly.db`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
