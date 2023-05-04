const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

module.exports.verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.userId = decoded.id;
        res.json({ message: 'Token Verify' });
        console.log("middleware", decoded);
        next();
    });
};

// exports.verifyToken = (req, res, next) => {
//     try {
//         const token = req.headers["x-access-token"];
//         if (!token) {
//             return res.status(401).send("No Token, Authorization Denied!!!");
//         }
//         const decoded = jwt.verify(token, config.secret);
//         req.user = decoded.user;
//         console.log("middleware", decoded);
//         next();
//     } catch (error) {
//         console.log(error);
//         return res.status(401).send("Token Invalid!!!");
//     }
// };

// module.exports.verifyToken = async (req, res) => {
//     try {
//         // Get the JWT from the request header
//         const token = req.headers['x-access-token'];
//         // Verify the JWT
//         jwt.verify(token, config.secret, (error, decoded) => {
//             if (error) {
//                 res.status(401).json({ message: 'Not authorized' });
//             } else {
//                 // The JWT is valid, so send the protected data
//                 res.json({ data: 'protected data' });
//             }
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
