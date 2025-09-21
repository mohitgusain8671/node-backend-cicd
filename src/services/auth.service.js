import logger from "#config/logger.js"
import bcrypt from 'bcrypt';
import { db } from "#config/database.js";
import { users } from "#models/user.model.js";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
        logger.error('Error hashing password:', error);
        throw new Error('Password Hashing Failed');
    }
};

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        logger.error('Error comparing password:', error);
        throw new Error('Password Comparison Failed');
    }
};

export const createUser = async ({ name, email, password, role='user' }) => {
    try {
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if(existingUser.length > 0) {
            throw new Error('User with this email already exists');
        }
        const hashedPassword = await hashPassword(password);
        const [newUser] = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            role,
        }).returning({ id: users.id, name: users.name, email: users.email, role: users.role, created_at: users.created_at });
        logger.info(`New user created: ${email}`);
        return newUser;
    } catch (error) {
        logger.error('Error creating user:', error);
        throw error;
    }
};

export const authenticateUser = async ({ email, password }) => {
    try {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            throw new Error('User not found');
        }
        
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        logger.info(`User authenticated: ${email}`);
        return userWithoutPassword;
    } catch (error) {
        logger.error('Error authenticating user:', error);
        throw error;
    }
};
