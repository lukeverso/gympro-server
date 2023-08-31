import { Request, Response, Router } from 'express';

import { postRoutes } from './routes/post.routes';
import { getRoutes } from './routes/get.routes';
import { updateRoutes } from './routes/update.routes';
import { deleteRoutes } from './routes/delete.routes';

const router = Router();

router.get('/test', (request: Request, response: Response) => {
     response.send('All set and working fine.')
});

router.use('/api/post', postRoutes);
router.use('/api/get', getRoutes);
router.use('/api/put', updateRoutes);
router.use('/api/delete', deleteRoutes);

export { router };