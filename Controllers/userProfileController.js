const users = require('../Model/userModel')
const bcrypt = require('bcryptjs')

// update profile
exports.updateUserProfileController = async (req, res) => {
    console.log("inside update user controller")
    const { username, phone, address, email } = req.body;
    const profilePic = req.file.filename
    const userId = req.userId
    try {
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.username = username || user.username;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.profilePic = profilePic || user.profilePic;

        await user.save();
        res.status(200).json({ message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
}

// get user profile
exports.getUserProfileController = async (req, res) => {
    const userId = req.userId
    try {
        // do not send password
        const user = await users.findById(userId).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user)
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" })
    }
}

// get seller profile (for messaging page)
exports.getSellerProfileController = async (req, res) => {
    const { sellerId } = req.params
    try {
        // do not send password
        const seller = await users.findById(sellerId).select('-password');
        if (!seller) return res.status(404).json({ message: "Seller not found" });
        res.status(200).json(seller)
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" })
    }
}

// change password
exports.changePasswordController = async (req, res) => {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Password change error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
