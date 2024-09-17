
// import { Blackjack } from './casino/blackjack';
import { Request, Response, NextFunction } from 'express';

import GameLists from '../../models//games/gamelist';

import Blackjack from './casino/blackjack';

export const turn = async (req: Request, res: Response, next: NextFunction) => {
    console.log(`request is received`);
    const game = await GameLists.findOne({ where: {gid: req.body.gameId} });
    if (!game?.status) {
        return res.status(400).json('Game is temporarily unavailable.');
    }
    switch (req.body.gameId) {
        case 'blackjack':
            return await Blackjack(req, res);
        default:
            break;
    }
    return res.status(400).json('Game is temporarily unavailable.');
};
