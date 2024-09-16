// src/models/Session.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './../../db';

interface SessionAttributes {
    id: number; // Assuming ObjectId is stored as a string
    user_id: number; // Assuming ObjectId is stored as a string
    ip_address?: string; // Optional
    user_agent?: string; // Optional, can be stored as JSON
    payload?: string; // Optional, can be stored as JSON
    last_activity?: number; // Optional, can be stored as JSON
}

interface SessionCreationAttributes extends Optional<SessionAttributes, 'user_id' | 'ip_address' | 'user_agent'> {}

class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
    public id!: number;
    public user_id!: number;
    public ip_address?: string;
    public user_agent?: string;
    public payload?: string;
    public last_activity?: number;
}

Session.init(
    {
        id: {
            type: DataTypes.NUMBER,
            primaryKey: true, // Assuming 'id' is the primary key
            allowNull: false,
        },
        user_id: {
            type: DataTypes.NUMBER, // Change to STRING if using ObjectId as a string
        },
        ip_address: {
            type: DataTypes.STRING,
        },
        user_agent: {
            type: DataTypes.STRING,
        },
        payload: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_activity: {
            type: DataTypes.NUMBER,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: 'sessions',
        timestamps: true,
        underscored: true, // Use underscored field names
    }
);

export default Session;
