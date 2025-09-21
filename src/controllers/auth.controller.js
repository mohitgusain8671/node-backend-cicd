import logger from "#config/logger.js";
import { createUser, authenticateUser } from "#services/auth.service.js";
import { cookies } from "#utils/cookies.js";
import { formatValidationErrors } from "#utils/formatValidation.js";
import { jwtToken } from "#utils/jwt.js";
import { signUpSchema, signInSchema } from "#validations/auth.validation.js";

export const signup = async (req, res, next) => {
    try {
        const validationResult = signUpSchema.safeParse(req.body);
        if (!validationResult.success) {
            const errorMessages = formatValidationErrors(validationResult.error);
            return res.status(400).json({ error: 'Validation failed', details: errorMessages });
        }
        const { name, email, password, role } = validationResult.data;
        // AUTH SERVICE
        const user = await createUser({ name, email, password, role });
        const token = jwtToken.sign({ id: user.id, email: user.email, role: user.role });

        cookies.set(res, 'token', token);

        logger.info(`User signed up: ${email}`);
        res.status(201).json({ 
            message: 'User registered successfully', 
            user
        });

    } catch (error) {
        logger.error('Error in signup controller:', error);
        if(error.message==='User with this email already exists'){
            return res.status(409).json({ error: 'Email Already Exists' });
        }
        next(error);
    }
};

export const signin = async (req, res, next) => {
    try {
        const validationResult = signInSchema.safeParse(req.body);
        if (!validationResult.success) {
            const errorMessages = formatValidationErrors(validationResult.error);
            return res.status(400).json({ error: 'Validation failed', details: errorMessages });
        }
        
        const { email, password } = validationResult.data;
        const user = await authenticateUser({ email, password });
        const token = jwtToken.sign({ id: user.id, email: user.email, role: user.role });
        
        cookies.set(res, 'token', token);
        
        logger.info(`User signed in: ${email}`);
        res.status(200).json({
            message: 'User logged in successfully',
            user
        });
        
    } catch (error) {
        logger.error('Error in signin controller:', error);
        if (error.message === 'User not found' || error.message === 'Invalid password') {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        next(error);
    }
};

export const signout = async (req, res, next) => {
    try {
        cookies.clear(res, 'token');
        
        logger.info('User signed out successfully');
        res.status(200).json({
            message: 'User logged out successfully'
        });
        
    } catch (error) {
        logger.error('Error in signout controller:', error);
        next(error);
    }
};
