// src/models/User.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './../../db';
import * as bcrypt from 'bcryptjs';

interface UserAttributes {
    id: number; // Assuming ObjectId is stored as a string
    email: string;
    password?: string; // Optional for security reasons
    username: string;
    firstname?: string; // Optional
    lastname?: string; // Optional
    permissionId?: string; // Assuming ObjectId is stored as a string
    oddsformat?: string; // Optional
    nonce?: number; // Optional
    avatar?: string; // Optional
    ip?: string; // Optional
    country?: string; // Optional
    isVerified?: boolean; // Optional
    status?: boolean; // Optional
    created_at?: Date; // Optional for Sequelize
    updated_at?: Date; // Optional for Sequelize
}

interface UserCreationAttributes extends Optional<UserAttributes, 'firstname' | 'lastname' | 'oddsformat' | 'nonce' | 'avatar' | 'ip' | 'country' | 'isVerified' | 'status' | 'created_at' | 'updated_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public password?: string;
    public username!: string;
    public firstname?: string;
    public lastname?: string;
    public permissionId?: string; // Assuming ObjectId is stored as a string
    public oddsformat?: string;
    public mobile?: number;
    public cryptoAccount?: string;
    public publicAddress?: string;
    public nonce?: number;
    public avatar?: string;
    public ip?: string;
    public country?: string;
    public iReferral?: string;
    public rReferral?: string;
    public isVerified?: boolean;
    public status?: boolean;

    // Timestamps
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Password hashing and validation methods
    public generateHash(password: string): string {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    }

    public validPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.password || '');
    }
}

User.init(
    {
        id: {
            type: DataTypes.NUMBER,
            primaryKey: true, // Assuming 'id' is the primary key
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        username: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        firstname: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        lastname: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: true,
        },
        permissionId: {
            type: DataTypes.NUMBER, // Assuming ObjectId is stored as a string
            field: `permissionId`,
        },
        oddsformat: {
            type: DataTypes.STRING,
            defaultValue: 'decimal',
            allowNull: true,
        },
        nonce: {
            type: DataTypes.INTEGER,
        },
        avatar: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        ip: {
            type: DataTypes.STRING,
        },
        country: {
            type: DataTypes.STRING,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: `isVerified`,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
        underscored: true, // Use underscored field names
    }
);

export default User;
