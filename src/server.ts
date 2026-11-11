import { serve } from '@hono/node-server';
import { createStore } from './store/store';
import { createApp } from './web/app';

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: createApp(createStore()).fetch, port }, () => {
  console.log(`Krankenkasse light läuft auf http://localhost:${port}`);
});
