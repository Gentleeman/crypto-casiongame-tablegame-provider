import { where, Op } from 'sequelize';
import sequelize from './../../../../db';
import Games from './../../../../models/games/game';
import Balances from './../../../../models/payments/balances';
import Currencies from './../../../../models/payments/currencies';
import BalanceHistories from './../../../../models/payments/balancehistories';
import Sessions from './../../../../models/users/sessions';
import Users from './../../../../models/users/users';


const NumberFix = (number: number, decimal = 10): number => {
    return Number(Number(number).toFixed(decimal));
};

export const checkBalance = async ({ userId, currency, amount }: { userId: number; currency: number; amount: number }) => {
    console.log(`currency in checkBalance`, currency);
    const balance = await Balances.findOne({
        where: {
            userId: userId,
            currencyId: currency
        }
    });
    if (balance?.balance && balance.balance >= amount) {
        return true;
    } else {
        return false;
    }
};

export const checkMaxBet = async ({ currency, amount }: { currency: number; amount: number }) => {
    console.log(`currency in checkMaxBet`, currency);

    const data = await Currencies.findOne({where: {id: currency}});

    if ((data?.maxBet ?? 0) >= amount && (data?.minBet ?? 0) <= amount) {
        return true;
    } else {
        return false;
    }
};

export const generateInfo = (): string => {
    return String(Date.now() + Math.random());
};

export const handleBet = async ({
    req = undefined,
    userId,
    amount,
    currency,
    type,
    info = '',
    status = false
}: {
    req?: any;
    userId: number;
    amount: number;
    currency: number;
    type: string;
    info: string;
    status?: boolean;
}) => {
    const user = await Users.findByPk(userId);
    console.log(`currency in handleBet`, currency);
    if (status) {
        // const userId1 = userId;
        // const amount1 = NumberFix(amount);
        // const result1 = await Balances.findOneAndUpdate(
        //     { userId: userId1, currency: currency },
        //     { $inc: { balance: amount1 } },
        //     { new: true }
        // );
        // const currentBalance1 = NumberFix(result1.balance);
        // const beforeBalance1 = NumberFix(result1.balance - amount);
        // await BalanceHistories.create({
        //     userId: userId1,
        //     amount: amount1,
        //     currency,
        //     type,
        //     currentBalance: currentBalance1,
        //     beforeBalance: beforeBalance1,
        //     info
        // });
        // if (result1.status && !result1.disabled && req) {
        //     const session = await Sessions.findOne({ userId });
        //     if (session && session.socketId) req.app.get('io').to(session.socketId).emit('balance', { balance: result1.balance });
        // }
        // return result1;
    } else {
        const result = await Balances.update(
            { balance: sequelize.literal(`balance + ${NumberFix(amount)}`) },
            {
                where: {
                    userId: userId,
                    currencyId: currency,
                },
                returning: true, // 업데이트된 레코드 반환
            }
        );
        const currentBalance = NumberFix(result[1][0].balance);
        const beforeBalance = NumberFix(result[1][0].balance - amount);

        await BalanceHistories.create({
            userId,
            amount,
            currencyId: currency,
            type,
            currentBalance,
            beforeBalance,
            info
        });
        // if (result[1][0].status && !result[1][0].disabled && req) {
        //     // const session = await Sessions.findOne({ userId });
        //     // if (session && session.socketId) req.app.get('io').to(session.socketId).emit('balance', { balance: result.balance });
        // }

        return result[1][0];
    }
};

export const getProfit = async (currency = 1, dates = []) => {
    const date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(firstDay.getTime() + 2678400000);
    if (dates?.length) {
        firstDay = dates[0];
        lastDay = dates[1];
    }
    let lost = 0;
    let win = 0;
    let input = 0;
    let output = 0;
    const allGames = await Games.findAll({
        where: {
            status: {
                [Op.ne]: 'BET' // not equal
            },
            currencyId: currency,
            created_at: {
                [Op.gte]: firstDay, // greater than or equal
                [Op.lte]: lastDay   // less than or equal
            }
        }
    });
    for (const key in allGames) {
        input += allGames[key].amount;
        if (allGames[key].status === 'DRAW') {
            output += allGames[key].profit;
        }
        if (allGames[key].status === 'WIN') {
            win += allGames[key].profit - allGames[key].amount;
            output += allGames[key].profit;
        }
        if (allGames[key].status === 'LOST') {
            lost += allGames[key].amount - allGames[key].profit;
            output += allGames[key].profit;
        }
    }
    return {
        input,
        output,
        lost,
        win,
        profit: lost - win,
        percent: Number(((output / input) * 100).toFixed(2))
    };
};
