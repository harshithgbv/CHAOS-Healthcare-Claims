import express from 'express';
import { analyzeClaims } from './src/logic/detector';
import { syntheticClaims } from './src/logic/syntheticData';

const app = express();
app.use(express.json());

app.get('/api/claims', (req, res) => {
  const analyzed = analyzeClaims(syntheticClaims);
  res.json(analyzed);
});

// For development in Vite
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
