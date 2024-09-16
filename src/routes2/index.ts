import routerx from 'express-promise-router';
import games from './games';

const router = routerx();
router.use('/games', games);

export default router;
