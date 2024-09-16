// src/models/Currency.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './../../db';

interface CurrencyAttributes {
    id: number; // Assuming ObjectId is stored as a string
    name: string;
    symbol: string;
    icon: string;
    payment?: string; // Optional
    buyUrl?: string; // Optional
    coingecko?: string; // Optional
    price?: number; // Optional
    minDeposit?: number; // Optional
    minWithdraw?: number; // Optional
    minBet?: number; // Optional
    maxBet?: number; // Optional
    decimals?: number; // Optional
    betLimit?: number; // Optional
    adminAddress?: string; // Optional
    type: number;
    status?: boolean; // Optional
    deposit?: boolean; // Optional
    withdrawal?: boolean; // Optional
    order?: number; // Optional
    officialLink?: string; // Optional
    created_at?: Date; // Optional for Sequelize
    updated_at?: Date; // Optional for Sequelize
}

interface CurrencyCreationAttributes extends Optional<CurrencyAttributes, 'name' | 'symbol' | 'icon' | 'payment' | 'buyUrl' | 'coingecko' | 'adminAddress' | 'order' | 'officialLink' | 'created_at' | 'updated_at'> {}

class Currency extends Model<CurrencyAttributes, CurrencyCreationAttributes> implements CurrencyAttributes {
    public id!: number;
    public name!: string;
    public symbol!: string;
    public icon!: string;
    public payment?: string;
    public buyUrl?: string;
    public coingecko?: string;
    public price?: number;
    public minDeposit?: number;
    public minWithdraw?: number;
    public minBet?: number;
    public maxBet?: number;
    public decimals?: number;
    public betLimit?: number;
    public adminAddress?: string;
    public type!: number;
    public status!: boolean;
    public deposit!: boolean;
    public withdrawal!: boolean;
    public order?: number;
    public officialLink?: string;

    // Timestamps
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Currency.init(
    {
        id: {
            type: DataTypes.NUMBER,
            primaryKey: true, // Assuming 'id' is the primary key
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING
        },
        symbol: {
            type: DataTypes.STRING
        },
        icon: {
            type: DataTypes.STRING
        },
        payment: {
            type: DataTypes.STRING
        },
        buyUrl: {
            type: DataTypes.STRING,
            field: 'buyUrl',
        },
        coingecko: {
            type: DataTypes.STRING
        },
        price: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false,
        },
        minDeposit: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false,
            field: 'minDeposit',
        },
        minWithdraw: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false,
            field: 'minWithdraw',
        },
        minBet: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false,
            field: 'minBet',
        },
        maxBet: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false,
            field: 'maxBet',
        },
        decimals: {
            type: DataTypes.INTEGER,
            defaultValue: 18,
            allowNull: false,
        },
        betLimit: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false,
            field: 'betLimit',
        },
        adminAddress: {
            type: DataTypes.STRING,
            defaultValue: '',
            field: 'adminAddress',
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        deposit: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        withdrawal: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        officialLink: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: true,
            field: 'officialLink',
        },
    },
    {
        sequelize,
        tableName: 'currencies',
        timestamps: true,
        underscored: true, // Use underscored field names
    }
);

export default Currency;
