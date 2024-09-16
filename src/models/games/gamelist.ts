// src/models/GameList.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../db';

interface GameListAttributes {
    id: number;
    name: string;
    type: string;
    img: string;
    icon: string;
    overlay: string;
    rtp: number;
    order: number;
    status: boolean;
    gid: string;
    created_at?: Date; // Optional for Sequelize
    updated_at?: Date; // Optional for Sequelize
}

interface GameListCreationAttributes extends Optional<GameListAttributes, 'created_at' | 'updated_at'> {}

class GameList extends Model<GameListAttributes, GameListCreationAttributes> implements GameListAttributes {
    public id!: number;
    public name!: string;
    public type!: string;
    public img!: string;
    public icon!: string;
    public overlay!: string;
    public rtp!: number;
    public order!: number;
    public status!: boolean;
    public gid!: string;

    // Timestamps
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

GameList.init(
    {
        id: {
            type: DataTypes.NUMBER,
            primaryKey: true, // Assuming 'id' is the primary key
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false
        },
        img: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false
        },
        icon: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false
        },
        overlay: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false
        },
        rtp: {
            type: DataTypes.FLOAT, // Use FLOAT for decimal numbers
            defaultValue: 95,
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        gid: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false
        },
    },
    {
        sequelize,
        tableName: 'gamelists',
        timestamps: true, // Enable timestamps
        underscored: true, // Use underscored field names
    }
);

export default GameList;
