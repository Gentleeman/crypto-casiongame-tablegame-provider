
import mongoose from 'mongoose';
import { BalanceHistories, Balances, Currencies, Games, Sessions, Users } from './../../../../models';

const NumberFix = (number: number, decimal = 10): number => {
    return Number(Number(number).toFixed(decimal));
};

export const checkBalance = async ({ userId, currency, amount }: { userId: string; currency: string; amount: number }) => {
    const balance = await Balances.findOne({
        userId: ObjectId(userId),
        currency: ObjectId(currency)
    });
    if (balance?.balance && balance.balance >= amount) {
        return true;
    } else {
        return false;
    }
};

export const checkMaxBet = async ({ currency, amount }: { currency: string; amount: number }) => {
    const data = await Currencies.findById(ObjectId(currency));
    if (data.maxBet >= amount && data.minBet <= amount) {
        return true;
    } else {
        return false;
    }
};

export const generatInfo = (): string => {
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
    req?: any | undefined;
    userId: string;
    amount: number;
    currency: string;
    type: string;
    info: string;
    status?: boolean | undefined;
}) => {
    const user = await Users.findById(ObjectId(userId));
    if (status && user?.rReferral && user.rReferral !== '') {
        const rUser = await Users.findOne({ iReferral: user.rReferral });
        const userId1 = ObjectId(userId);
        const userId2 = ObjectId(rUser?._id);
        const amount1 = NumberFix(amount * 0.95);
        const amount2 = NumberFix(amount * 0.05);
        const result1 = await Balances.findOneAndUpdate(
            { userId: userId1, currency: ObjectId(currency) },
            { $inc: { balance: amount1 } },
            { new: true }
        );
        const result2 = await Balances.findOneAndUpdate(
            { userId: userId2, currency: ObjectId(currency) },
            { $inc: { balance: amount2 } },
            { new: true, upsert: true }
        );
        const currentBalance1 = NumberFix(result1.balance);
        const beforeBalance1 = NumberFix(result1.balance - amount);
        const currentBalance2 = NumberFix(result2.balance);
        const beforeBalance2 = NumberFix(result2.balance - amount);
        await BalanceHistories.create({
            userId: userId1,
            amount: amount1,
            currency,
            type,
            currentBalance: currentBalance1,
            beforeBalance: beforeBalance1,
            info
        });
        await BalanceHistories.create({
            userId: userId2,
            amount: amount2,
            currency,
            type: 'referral-bonus',
            currentBalance: currentBalance2,
            beforeBalance: beforeBalance2,
            info
        });
        if (result1.status && !result1.disabled && req) {
            const session = await Sessions.findOne({ userId });
            if (session && session.socketId) req.app.get('io').to(session.socketId).emit('balance', { balance: result1.balance });
        }
        return result1;
    } else {
        const result = await Balances.findOneAndUpdate(
            { userId: ObjectId(userId), currency: ObjectId(currency) },
            { $inc: { balance: NumberFix(amount) } },
            { new: true }
        );
        const currentBalance = NumberFix(result.balance);
        const beforeBalance = NumberFix(result.balance - amount);
        await BalanceHistories.create({
            userId,
            amount,
            currency,
            type,
            currentBalance,
            beforeBalance,
            info
        });
        if (result.status && !result.disabled && req) {
            const session = await Sessions.findOne({ userId });
            if (session && session.socketId) req.app.get('io').to(session.socketId).emit('balance', { balance: result.balance });
        }
        return result;
    }
};

export const ObjectId = (id: string) => {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch (error) {
        console.log('ObjectId', id);
    }
};

export const getProfit = async (currency: string, dates = []) => {
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
    const allGames = await Games.find({
        status: { $ne: 'BET' },
        currency: ObjectId(currency),
        createdAt: { $gte: firstDay, $lte: lastDay }
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