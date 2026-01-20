const { auth } = require('../firebaseAdmin');

// Authentication and Authorization Middleware
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim().toLowerCase())
    : [];

//Authenticate middleware
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Missing Authorization header. Expected format: Bearer <token>'
            });
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid Authorization header format. Expected: Bearer <token>'
            });
        }

        const token = parts[1].trim();

        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }
        const decodedToken = await auth.verifyIdToken(token);
        if (!decodedToken.email) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No email found in authentication token. Please sign in with a valid account.'
            });
        }
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified || false
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error.message);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token has expired. Please sign in again.'
            });
        }

        if (error.code === 'auth/argument-error') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token format'
            });
        }

        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Failed to authenticate token'
        });
    }
};


// Middleware to check if authenticated user is an admin

const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }
    if (!req.user.email) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'No email available for authorization check'
        });
    }

    const userEmail = req.user.email.toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(userEmail);

    if (!isAdmin) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required. You do not have permission to perform this action.'
        });
    }

    next();
};

module.exports = {
    authenticate,
    requireAdmin
};
