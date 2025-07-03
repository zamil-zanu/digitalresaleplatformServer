const jwt = require('jsonwebtoken')
// Middleware to protect routes
exports.jwtMiddleware = (req, res, next) => {
    const token = req.headers["authorization"].split(" ")[1]
    if (token) {
        try {
            const jwtResponse = jwt.verify(token, process.env.JWT_PASSWORD)
            req.userId=jwtResponse.userId
            req.userRole=jwtResponse.role
            next()

        } catch (err) {
            res.status(401).json({ message: "Invalid token" })
        }
    } else {
        res.status(401).json({ message: "No token provided" })
    }

}

// Middleware to check admin role
exports.adminOnlyMiddleware =(req,res,next)=>{
    if(req.userRole==='admin'){
        console.log("inside admin only");
        next()
    }
    else{
        res.status(403).json({message:"Access denied.Admin Only !! "})
    }
}