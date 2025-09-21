import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';
import { loggers } from 'winston';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export const jwtToken = {
    sign: (payload) => { 
        try {
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        } catch (error) {
            logger.error('Error signing JWT:', error);
            throw new Error('Failed to Authenticate Token');
        }
    },
    verify: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            logger.error('Error verifying JWT:', error);
            throw new Error('Invalid Token');
        }
    }
}