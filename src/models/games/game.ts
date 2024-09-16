// src/models/Game.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './../../db';

interface GameAttributes {
    id?: number; // Assuming ObjectId is stored as a string
    userId: number; // Assuming ObjectId is stored as a string
    currencyId: number; // Assuming ObjectId is stored as a string
    gameId: number; // Assuming ObjectId is stored as a string
    odds: number;
    amount: number;
    profit: number;
    betting?: object; // Optional
    aBetting?: object; // Optional
    status: string;
    created_at?: Date; // Optional for Sequelize
    updated_at?: Date; // Optional for Sequelize
}

interface GameCreationAttributes extends Optional<GameAttributes, 'betting' | 'aBetting' | 'created_at' | 'updated_at'> {}

class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
    public id?: number;
    public userId!: number;
    public currencyId!: number;
    public gameId!: number;
    public odds!: number;
    public amount!: number;
    public profit!: number;
    public betting?: object;
    public aBetting?: object;
    public status!: string;

    // Timestamps
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Game.init(
    {
        id: {
            type: DataTypes.INTEGER, // Use INTEGER for primary key
            autoIncrement: true, // Automatically increment the id
            primaryKey: true, // Set as primary key
        },
        userId: {
            type: DataTypes.NUMBER, // Change to STRING if using ObjectId as a string
            allowNull: true,
            field: `userId`
        },
        currencyId: {
            type: DataTypes.NUMBER, // Change to STRING if using ObjectId as a string
            allowNull: false,
            field: `currencyId`
        },
        gameId: {
            type: DataTypes.NUMBER, // Change to STRING if using ObjectId as a string
            allowNull: false,
            field: `gameId`
        },
        odds: {
            type: DataTypes.FLOAT, // Use FLOAT for decimal numbers
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT, // Use FLOAT for decimal numbers
            allowNull: false,
        },
        profit: {
            type: DataTypes.FLOAT, // Use FLOAT for decimal numbers
            defaultValue: 0,
            allowNull: false,
        },
        betting: {
            type: DataTypes.JSON, // Use JSON for object types
            allowNull: true,
        },
        aBetting: {
            type: DataTypes.JSON, // Use JSON for object types
            allowNull: true,
            field: `aBetting`
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'BET',
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'games',
        timestamps: true,
        underscored: true, // Use underscored field names
    }
);

export default Game;
