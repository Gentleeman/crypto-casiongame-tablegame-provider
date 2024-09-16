
import { Blackjack } from './casino/blackjack';
import { GameLists } from '../../models';
import { Request, Response, NextFunction } from 'express';

export const turn = async (req: Request, res: Response, next: NextFunction) => {
    const game = await GameLists.findOne({ id: req.body.gameId });
    if (!game.status) {
        return res.status(400).json('Game is temporarily unavailable.');
    }
    switch (req.body.gameId) {
        case 'blackjack':
            return await Blackjack(req, res, next);
        default:
            break;
    }
    return res.status(400).json('Game is temporarily unavailable.');
};
