import { Request, Response, NextFunction } from 'express';
import * as actions from './actions';
import Game from './game';
import GameLists from './../../../../models/games/gamelist';
import sequelize from '../../../../db';
import Games from './../../../../models/games/game';
import { checkBalance, checkMaxBet, generateInfo, handleBet } from './base';
import { type } from 'os';

const getScore = (cards: any) => {
    const score = cards.reduce((sum: number, card: any) => {
        if ((card?.value || 0) === 1) {
            return (sum += 11);
        } else {
            return (sum += card?.value || 0);
        }
    }, 0);
    if (score > 21 && cards.find((e: any) => e.value === 1)) {
        return cards.reduce((sum: number, card: any) => (sum += card?.value || 0), 0);
    } else {
        return score;
    }
};

const getCard = (card: any) => {
    return actions.deck.find((e: any) => e.type === card.suite && e.value === card.text);
};

const settled = async ({
    req,
    _id,
    game,
    games,
    split = false
}: {
    req: any;
    _id: any;
    game: any;
    games: any;
    split?: boolean | undefined;
}) => {
    const { history, dealerCards, wonOnRight, wonOnLeft } = game.getState();

    const score = getScore([dealerCards[0], dealerCards[1]]);
    let status = 'LOST';
    let playerStatus = 'LOST';
    let splitStatus = 'LOST';
    if (wonOnRight === games.amount / 2) {
        playerStatus = 'DRAW';
    } else if (wonOnRight > games.amount / 2) {
        playerStatus = 'WIN';
    }
    if (wonOnLeft === games.amount / 2) {
        splitStatus = 'DRAW';
    } else if (wonOnLeft > games.amount / 2) {
        splitStatus = 'WIN';
    }
    let profit = wonOnRight + wonOnLeft;

    if (profit === games.amount) {
        status = 'DRAW';
    } else if (profit > 0) {
        status = 'WIN';
    }
    if (history.find((e: any) => e.type === 'INSURANCE' && e.payload.bet > 0)) {
        if (score === 21) {
            status = 'WIN';
            profit = games.amount;
        } else {
            status = 'LOST';
            profit = games.amount;
        }
    }
    const dealerDraw = [] as any;
    const dealerCard = dealerCards.slice(2, dealerCards.length);
    for (const i in dealerCard) {
        dealerDraw.push(getCard(dealerCard[i]));
    }

    const check = (await Games.findOne({ where: { id: _id } })) as any;

    const result = (await Games.update(
        {
            profit,
            status,
            aBetting: game.getState(),
            betting: {
                ...check?.betting,
                turn: (check?.betting?.turn ?? 0) + 1
            }
        },
        {
            where: { id: _id },
            returning: true
        }
    )) as any;

    const resultData = result[1][0];
    if (profit && check?.status === 'BET') {
        await handleBet({
            req,
            currency: games.currencyId,
            userId: games.userId,
            amount: profit,
            type: 'casino-bet-settled(blackjack)',
            info: `${resultData?.id}`
        });
    }

    if (split) {
        return {
            type: 'finish',
            turn: resultData?.betting?.turn,
            player: {
                status: playerStatus,
                odds: wonOnRight ? (wonOnRight / resultData?.amount) * 2 : 0,
                profit: wonOnRight
            },
            split: {
                status: splitStatus,
                odds: wonOnLeft ? (wonOnLeft / resultData?.amount) * 2 : 0,
                profit: wonOnLeft
            },
            betting: {
                dealerReveal: getCard(dealerCards[1]),
                dealerDraw
            }
        };
    } else {
        return {
            type: 'finish',
            turn: resultData?.betting?.turn,
            odds: profit ? profit / resultData?.amount : 0,
            profit,
            split,
            status,
            betting: {
                dealerReveal: getCard(dealerCards[1]),
                dealerDraw
            }
        };
    }
};

export const Blackjack = async (req: Request, res: Response) => {
    switch (req.body.type) {
        case 'info': {
            const { userId, currency, amount } = req.body;

            const gamelist = await GameLists.findOne({ where: { gid: req.body?.gameId } });
            const gameId = gamelist?.dataValues?.id;

            const exist = await Games.findOne({
                where: {
                    userId: currency,
                    currencyId: currency,
                    gameId,
                    status: 'BET'
                }
            });

            if (exist) {
                console.log(`exist game`);
                return res.json(exist);
            }
            const checked = await checkBalance({ userId, currency, amount });
            const checkedMax = await checkMaxBet({ currency, amount });
            if (!checked) {
                return res.status(400).json('Balances not enough!');
            }
            if (!checkedMax) {
                return res.status(400).json('Maximum bet exceeded!');
            }
            await handleBet({
                req,
                currency,
                userId,
                amount: amount * -1,
                type: 'casino-bet(blackjack)',
                info: generateInfo()
            });
            const game = new Game({ currency, init: true });
            await game.dispatch(actions.deal({ bet: Number(amount) }));
            const gameData = {
                userId,
                currencyId: currency,
                gameId,
                amount,
                odds: 2,
                aBetting: game.getState(),
                betting: { player: [], dealer: {}, turn: 0 }
            };

            let games;
            const existingGame = await Games.findOne({
                where: {
                    userId,
                    currencyId: currency,
                    gameId,
                    status: 'BET'
                }
            });

            if (existingGame) {
                await Games.update(gameData, {
                    where: {
                        userId,
                        currencyId: currency,
                        gameId,
                        status: 'BET'
                    }
                });
                games = await Games.findOne({
                    where: {
                        userId,
                        currencyId: currency,
                        gameId,
                        status: 'BET'
                    }
                });
            } else {
                const newGame = await Games.create({
                    ...gameData,
                    profit: 0,
                    status: 'BET',
                    gameId: gameId!
                });
                games = newGame;
            }

            const { handInfo, dealerCards } = game.getState();

            const betting = {
                player: [getCard(handInfo.right.cards[0]), getCard(handInfo.right.cards[1])],
                dealer: getCard(dealerCards[0]),
                turn: 1
            };

            const result = await Games.update(
                {
                    betting,
                    status: 'BET'
                },
                {
                    where: { id: games?.id },
                    returning: true
                }
            );

            return res.json(result[1][0]);
        }
        case 'split': {
            const { userId, betId } = req.body;
            const _id = betId;
            const games = await Games.findOne({ where: { id: _id } }) as any;
            const checked = await checkBalance({
                userId,
                currency: games.currencyId,
                amount: games.amount
            });
            if (!checked) {
                return res.status(400).json('Balances not enough!');
            }
            const game = new Game(games.aBetting);
            if (game.getState().stage === 'done') {
                const result = await settled({ req, _id, game, games });
                return res.json(result);
            }
            await game.dispatch(actions.split());
            const { handInfo, dealerCards } = game.getState();
            await handleBet({
                req,
                currency: games.currencyId,
                userId,
                amount: games.amount * -1,
                type: 'casino-bet-split(blackjack)',
                info: generateInfo()
            });
            const check = (await Games.findOne({ where: { id: _id } })) as any;
            const result = await Games.update(
                {
                    amount: games.amount * 2,
                    aBetting: game.getState(),
                    betting: {
                        ...check?.betting,
                        turn: (check?.betting?.turn ?? 0) + 1
                    }
                },
                { where: { id: _id }, returning: true }
            );
            const resultData = result[1][0] as any;
            return res.json({
                type: 'continue',
                turn: resultData?.betting?.turn,
                betting: {
                    player: [getCard(handInfo.right.cards[0]), getCard(handInfo.right.cards[1])],
                    split: [getCard(handInfo.left.cards[0]), getCard(handInfo.left.cards[1])],
                    dealer: [getCard(dealerCards[0])]
                }
            });
        }
        case 'double': {
            const { userId, betId } = req.body;
            const _id = betId;
            const games = (await Games.findOne({ where: { id: _id } })) as any;
            const checked = await checkBalance({
                userId,
                currency: games.currencyId,
                amount: games.amount
            });
            if (!checked) {
                return res.status(400).json('Balances not enough!');
            }
            const game = new Game(games.aBetting);
            if (game.getState().stage === 'done') {
                const result = await settled({ req, _id, game, games });
                return res.json(result);
            }
            await game.dispatch(actions.double({ position: 'right' }));
            await handleBet({
                req,
                currency: games.currencyId,
                userId,
                amount: games.amount * -1,
                type: 'casino-bet-double(blackjack)',
                info: generateInfo()
            });
            const check = (await Games.findOne({ where: { id: _id } })) as any;
            const result = await Games.update(
                {
                    amount: games.amount * 2,
                    aBetting: game.getState(),
                    betting: {
                        ...check?.betting,
                        turn: (check?.betting?.turn ?? 0) + 1
                    }
                },
                { where: { id: _id }, returning: true }
            );
            const cards = game.getState().handInfo.right.cards;
            const card = getCard(cards[cards.length - 1]);
            const gameData = result[1][0] as any;
            return res.json({
                type: 'continue',
                turn: gameData?.betting?.turn,
                betting: {
                    player: card
                }
            });
        }
        case 'insurance': {
            const { userId, betId, bet } = req.body;
            const _id = betId;
            const games = await Games.findOne({ where: { id: _id } }) as any;

            const checked = await checkBalance({
                userId,
                currency: games.currencyId,
                amount: games.amount * 0.5
            });
            if (!checked) {
                return res.status(400).json('Balances not enough!');
            }
            const game = new Game(games.aBetting);
            if (bet) {
                await game.dispatch(actions.insurance({ bet: 1 }));
                await handleBet({
                    req,
                    currency: games.currencyId,
                    userId,
                    amount: games.amount * -0.5,
                    type: 'casino-bet-insurance(blackjack)',
                    info: generateInfo()
                });
                const check = (await Games.findOne({ where: { id: _id } })) as any;
                const resAmount = parseFloat(games.amount) * 1.5;

                await Games.update(
                    {
                        amount: resAmount,
                        aBetting: game.getState(),
                        betting: {
                            ...check?.betting,
                            turn: (check?.betting?.turn ?? 0) + 1
                        }
                    },
                    { where: { id: _id }, returning: true }
                );

            } else {
                await game.dispatch(actions.insurance({ bet: 0 }));
                const check = (await Games.findOne({ where: { id: _id } })) as any;

                await Games.update(
                    {
                        aBetting: game.getState(),
                        betting: {
                            ...check?.betting,
                            turn: (check?.betting?.turn ?? 0) + 1
                        }
                    },
                    { where: { id: _id }, returning: true }
                );

            }
            return res.json(games);
        }
        case 'hit': {
            const _id = req.body.betId;
            const games = (await Games.findOne({ where: { id: _id } })) as any;
            const game = new Game(games?.aBetting);
            const stage = game.getState().stage;
            if (stage === 'player-turn-right') {
                await game.dispatch(actions.hit({ position: 'right' }));
                const check = (await Games.findOne({ where: { id: _id } })) as any;
                await Games.update(
                    {
                        aBetting: game.getState(),
                        betting: {
                            ...check?.betting,
                            turn: (check?.betting?.turn ?? 0) + 1
                        }
                    },
                    { where: { id: _id }, returning: true }
                );
                const cards = game.getState().handInfo.right.cards;
                const card = getCard(cards[cards.length - 1]);
                const result = {
                    type: 'continue',
                    turn: games?.betting?.turn,
                    betting: {
                        player: card
                    }
                };
                return res.json(result);
            } else if (stage === 'player-turn-left') {
                await game.dispatch(actions.hit({ position: 'left' }));
                const check = (await Games.findOne({ where: { id: _id } })) as any;
                await Games.update(
                    {
                        aBetting: game.getState(),
                        betting: {
                            ...check?.betting,
                            turn: (check?.betting?.turn ?? 0) + 1
                        }
                    },
                    { where: { id: _id }, returning: true }
                );
                const cards = game.getState().handInfo.left.cards;
                const result = {
                    type: 'continue',
                    turn: games.betting.turn,
                    betting: {
                        player: getCard(cards[cards.length - 1])
                    }
                };
                return res.json(result);
            } else if (stage === 'done') {
                const result = await settled({ req, _id, game, games });
                return res.json(result);
            }
        }
        case 'stand': {
            const _id = req.body.betId;
            const games = await Games.findOne({ where: { id: _id } }) as any;
            const game = new Game(games?.aBetting);
            const { stage, history } = game.getState();
            if (history.find((e: any) => e.type === 'SPLIT')) {
                if (stage === 'player-turn-right') {
                    await game.dispatch(actions.stand({ position: 'right' }));
                    const check = (await Games.findOne({ where: { id: _id } })) as any;
                    const result = await Games.update(
                        {
                            aBetting: game.getState(),
                            betting: {
                                ...check?.betting,
                                turn: (check?.betting?.turn ?? 0) + 1
                            }
                        },
                        { where: { id: _id }, returning: true }
                    );
                    const gameData = result[1][0] as any;
                    return res.json({
                        type: 'continue',
                        turn: gameData?.betting?.turn
                    });
                } else if (stage === 'player-turn-left' || stage === 'done') {
                    const cards = game.getState().handInfo.left.cards;
                    const score = getScore(cards);
                    if (req.body.auto && score < 21) {
                        const check = (await Games.findOne({ where: { id: _id } })) as any;
                        const result = await Games.update(
                            {
                                aBetting: game.getState(),
                                betting: {
                                    ...check?.betting,
                                    turn: (check?.betting?.turn ?? 0) + 1
                                }
                            },
                            { where: { id: _id }, returning: true }
                        );
                        const gameData = result[1][0] as any;

                        return res.json({
                            type: 'continue',
                            turn: gameData?.betting?.turn
                        });
                    } else {
                        if (stage === 'player-turn-left') {
                            await game.dispatch(actions.stand({ position: 'left' }));
                        }
                        const result = await settled({
                            req,
                            _id,
                            game,
                            games,
                            split: true
                        });
                        return res.json(result);
                    }
                }
            } else {
                if (stage === 'player-turn-right') {
                    await game.dispatch(actions.stand({ position: 'right' }));
                }
                const result = await settled({ req, _id, game, games });
                return res.json(result);
            }
        }
    }
};

export default Blackjack;
