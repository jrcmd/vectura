import dotenv from 'dotenv';
import { createServer } from './server';

dotenv.config();

const app = createServer();

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on :${port}`);
});

