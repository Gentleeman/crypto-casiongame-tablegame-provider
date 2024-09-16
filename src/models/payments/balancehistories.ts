// src/models/BalanceHistory.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './../../db';

interface BalanceHistoryAttributes {
    userId: number; // Assuming ObjectId is stored as a string
    currencyId: number; // Assuming ObjectId is stored as a string
    amount?: number; // Optional
    currentBalance?: number; // Optional
    beforeBalance?: number; // Optional
    type?: string; // Optional
    info?: string; // Optional
    created_at?: Date; // Optional for Sequelize
    updated_at?: Date; // Optional for Sequelize
}

interface BalanceHistoryCreationAttributes extends Optional<BalanceHistoryAttributes, 'created_at' | 'updated_at'> {}

class BalanceHistory extends Model<BalanceHistoryAttributes, BalanceHistoryCreationAttributes> implements BalanceHistoryAttributes {
    public userId!: number;
    public currencyId!: number;
    public amount?: number;
    public currentBalance?: number;
    public beforeBalance?: number;
    public type?: string;
    public info?: string;

    // Timestamps
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

BalanceHistory.init(
    {
        userId: {
            type: DataTypes.STRING, // Change to STRING if using ObjectId as a string
            allowNull: false,
            field: `userId`,
        },
        currencyId: {
            type: DataTypes.STRING, // Change to STRING if using ObjectId as a string
            allowNull: false,
            field: `currencyId`,
        },
        amount: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false,
        },
        currentBalance: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false,
            field: `currentBalance`,
        },
        beforeBalance: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: `beforeBalance`,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        info: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'balancehistories',
        timestamps: true,
        underscored: true, // Use underscored field names
    }
);

export default BalanceHistory;
