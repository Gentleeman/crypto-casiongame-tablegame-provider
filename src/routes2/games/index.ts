import routerx from 'express-promise-router';
import { turn } from '../../controllers/games';
const router = routerx();

router.post('/turn', turn);

export default router;
