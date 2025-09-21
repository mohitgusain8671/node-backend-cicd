import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
    try {
        const role = req.user?.role || 'guest';
        let limit;
        let message;
        switch(role) {
            case 'admin':
                limit = 20;
                message = 'Too many requests from admin';
                break;
            case 'user':
                limit = 10;
                message = 'Too many requests from user';
                break;
            default:
                limit = 5;
                message = 'Too many requests from guest';
        }
        const client = aj.withRule(slidingWindow({
            mode: 'LIVE',
            interval: '1m',
            max: limit,
            name: `${role}-rate-limit`
        }));
        const decision = await client.protect(req);

        if(decision.isDenied() && decision.reason.isBot()) {
            logger.warn('Request blocked (bot detected)', { ip: req.ip, path: req.path, userAgent: req.get('User-Agent') });
            return res.status(403).json({ error: 'Forbidden', message: 'Automated Request not allowed' });
        }

        if(decision.isDenied() && decision.reason.isShield()) {
            logger.warn('Request blocked (shield rule violated)', { ip: req.ip, path: req.path, userAgent: req.get('User-Agent'), method: req.method });
            return res.status(403).json({ error: 'Forbidden', message: 'Malicious activity detected' });
        }

        if(decision.isDenied() && decision.reason.isRateLimit()) {
            logger.warn('Request blocked (rate limit exceeded)', { ip: req.ip, path: req.path, userAgent: req.get('User-Agent'), method: req.method });
            return res.status(403).json({ error: 'Forbidden', message: 'too Many Requests' });
        }
        next();
    }
    catch (error) {
        console.error('Security middleware error:', error);
        res.status(500).json({ error: 'Request blocked by security middleware' });
    }
};

export default securityMiddleware;