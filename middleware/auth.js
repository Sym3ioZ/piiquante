const jwt = require ('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];  // Splits authorization string to retrieve token
        const decodedToken = jwt.verify(token, process.env.RANDOM_SECRET_TOKEN);  // Decodes token
        const userId = decodedToken.userId;  // Retrieves userId from the token object
        if (req.body.userId && req.body.userId !== userId) {  // If the userId in the request body doesn't fit the userId from the token
            return res.status(403).json({ error: 'Unauthorized request'});  // Then error, unauthorized
        } else {
            next ();  // Else go to next module
        }
    } catch {
        res.status(401).json({ error: new Error('Invalid request !') });
    }
};