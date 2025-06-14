const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Auth middleware: Received token:', token ? token.substring(0, 10) + '...' : 'No Token'); // Log masked token
        
        if (!token) {
            console.log('Auth middleware: No token provided.');
            return res.status(401).json({ 
                success: false,
                message: 'No authentication token, access denied' 
            });
        }

        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            console.log('Auth middleware: Decoded token payload:', decoded);
            
            // Explicitly set both to undefined to ensure clean state
            req.user = undefined;
            req.admin = undefined;

            // Check if it's a user token (userId) or admin token (adminId/role)
            if (decoded.role === 'admin' || decoded.role === 'super_admin') {
                // Admin token
                req.admin = { _id: decoded.adminId, role: decoded.role };
                console.log('Auth middleware: Admin token detected. req.admin:', req.admin);
            } else if (decoded.userId) {
                // User token (using userId from payload for existing user tokens)
                req.user = { _id: decoded.userId };
                console.log('Auth middleware: User token detected. req.user:', req.user);
            } else if (decoded.id) {
                // Fallback for user tokens that might only have 'id' and no 'role' explicitly set
                // This assumes if it's not an admin, it's a user.
                req.user = { _id: decoded.id };
                console.log('Auth middleware: User token (fallback) detected. req.user:', req.user);
            } else {
                // If no recognizable ID or role is present
                console.log('Auth middleware: Token payload missing valid ID or role.');
                return res.status(401).json({ 
                    success: false,
                    message: 'Token is not valid (missing user/admin ID or role)'
                });
            }
            console.log('Auth middleware: Final req.user after processing:', req.user);
            console.log('Auth middleware: Final req.admin after processing:', req.admin);
            next();
        } catch (err) {
            console.error('Auth middleware: JWT verification failed:', err.message);
            return res.status(401).json({ 
                success: false,
                message: 'Token is not valid or expired'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false,
            message: 'Token is not valid' 
        });
    }
}; 