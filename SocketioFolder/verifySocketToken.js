const jwt = require('jsonwebtoken');
const users = require('../Model/userModel'); // Mongoose User model

async function verifyTokenSocket(token) {
    console.log("inside verifyTokenSocket");
 
    try {
        const payload = jwt.verify(token, process.env.JWT_PASSWORD);
        console.log("payload",payload);
        
        // Optionally fetch user from DB to confirm existence
        const user = await users.findById(payload.userId);
        if (!user) throw new Error("User not found");
        return { id: user._id, name: user.username, email: user.email };
    } catch (err) {
        throw err;
    }
}

module.exports = { verifyTokenSocket };