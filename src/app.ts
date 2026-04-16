import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';




const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(cors());


app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1', routes);

app.use(errorMiddleware);




export default app;