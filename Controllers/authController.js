const users = require('../Model/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
// register controller

exports.registerController = async (req, res) => {
    console.log("inside Register Controller");
    // role,phone,address,profilePic,wishlist,cart,productListed,orders,isVerified

    const { username, email, password } = req.body
    try {
        const existingUser = await users.findOne({ email })
        if (existingUser) {
            res.status(406).json({ message: "User already exists" })
        }
        else {
            const newUser = await users({ username, email, password })
            await newUser.save()
            res.status(200).json(newUser)
        }
    }
    catch (err) {
        res.status(401).json(err)
    }
}

// login controller

exports.loginController = async (req, res) => {
    console.log("inside login controller");
    const { email, password } = req.body
    try {
        const existingUser = await users.findOne({ email })
        if (existingUser) {
            // Check password
            isPasswordMatch = await bcrypt.compare(password, existingUser.password)
            if (isPasswordMatch) {
                // generate token , // <-- include the user’s role here (along with userId)
                const token = jwt.sign({ userId: existingUser._id, role: existingUser.role }, process.env.JWT_PASSWORD)
                res.status(200).json({ message: "Login Successfull", token, user: existingUser })
            }
            else {
                res.json.status(401).json({ message: "invalid password" })
            }
        }
        else {
            return res.status(401).json({ message: "invalid email" })
        }
    }
    catch (err) {
        console.log(err);
    }
}

