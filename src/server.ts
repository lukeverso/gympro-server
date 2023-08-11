import express from 'express';
import cors from 'cors';
import { router } from './routes';

const server = express();

server.use(cors({
     origin: true
}));

server.use(express.json());

server.use(router);

server.listen(3333, '0.0.0.0', () => {
     console.log(`Server running at http://localhost:3333`);
});