import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analyzeClaims } from './src/logic/detector';
import { syntheticClaims } from './src/logic/syntheticData';

const app = express();
app.use(express.json());

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(currentDir, 'dist');

app.get('/api/claims', (_req, res) => {
  res.json(analyzeClaims(syntheticClaims));
});

if (process.env.NODE_ENV === 'production') {
  if (!existsSync(path.join(distPath, 'index.html'))) {
    throw new Error(
      'Production frontend not found. Run npm run build before starting.'
    );
  }

  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  const { createServer } = await import('vite');

  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);
}

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`CHAOS server listening on port ${PORT}`);
});
