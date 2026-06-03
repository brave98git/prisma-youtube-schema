import express from 'express';
import cors from 'cors';
import routes from './src/routes/index.ts';
import { sendError } from './src/utils/apiResponse.ts';


const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use((_req, res) => {
  return sendError(res, 'Route not found', 404);
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  return sendError(res, error.message || 'Internal server error', 500);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

