// src/models/Balance.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './../../db';

interface BalanceAttributes {
    id: number; // Assuming ObjectId is stored as a string
    userId: number; // Assuming ObjectId is stored as a string
    currencyId: number; // Assuming ObjectId is stored as a string
    balance: number;
    status: boolean;
    disabled: boolean;
    created_at?: Date; // Optional for Sequelize
    updated_at?: Date; // Optional for Sequelize
}

interface BalanceCreationAttributes extends Optional<BalanceAttributes, 'created_at' | 'updated_at'> {}

class Balance extends Model<BalanceAttributes, BalanceCreationAttributes> implements BalanceAttributes {
    public id!: number;
    public userId!: number;
    public currencyId!: number;
    public balance!: number;
    public status!: boolean;
    public disabled!: boolean;

    // Timestamps
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Balance.init(
    {
        id: {
            type: DataTypes.NUMBER,
            primaryKey: true, // Assuming 'id' is the primary key
            allowNull: false,
        },
        userId: {
            type: DataTypes.NUMBER,
            allowNull: false,
            field: `userId`,
        },
        currencyId: {
            type: DataTypes.NUMBER, // Change to STRING if using ObjectId as a string
            allowNull: false,
            field: `currencyId`,
        },
        balance: {
            type: DataTypes.FLOAT, // Use FLOAT for decimal numbers
            defaultValue: 0,
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        disabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'balances',
        timestamps: true,
        underscored: true, // Use underscored field names
    }
);

export default Balance;
