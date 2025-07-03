const users = require("../Model/userModel");
const mongoose = require('mongoose')

// 1.Add to Wishlist

exports.addToWishlistController = async (req, res) => {
    const { productId } = req.body;
    const userId = req.userId
    if (!productId) {
        return res.status(400).json({ message: "Missing product ID" });
    }

    try {
        const user = await users.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ message: "Already in wishlist", wishlist: user.wishlist });
        }
        // main logic add to wishlist if not in wishlist
        user.wishlist.push(productId)
        await user.save()
        return res.status(200).json({ wishlist: user.wishlist });
    }

    catch (err) {
        return res.status(500).json({ message: "server error" })
    }
}

// 2. get wishlist products
exports.getWishlistController = async (req, res) => {
    const userId = req.userId
    try {
        const user = await users.findById(userId).populate('wishlist')
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const wishlistItems = user.wishlist
        return res.status(200).json(wishlistItems)
    }
    catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

// 3.remove from wishlist
exports.removeWishlistItemController = async (req, res) => {
    console.log("inside removewishlist");

    const userId = req.userId
    const { productId } = req.params

    try {
        // productId string into ObjectId
        const pid = new mongoose.Types.ObjectId(productId)
        // here we removed item using $pull and then updated using updateOne method
        const result = await users.updateOne(
            { _id: userId },
            { $pull: { wishlist: pid } }
        )
        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: "Product not in the wishlist" })
        }
        const updatedUser = await users.findById(userId)
        return res.status(200).json({ wishlist: updatedUser.wishlist })
    }
    catch (err) {
        return res.status(500).json({ message: 'Error removing from wishlist' });
    }
}






// Add product to wishlist
exports.addToWishlist = async (req, res) => {
    const { productId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }
        res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Error adding to wishlist' });
    }
};

// Get wishlist
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
    const { productId } = req.params;
    try {
        const user = await User.findById(req.user.id);
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();
        res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Error removing from wishlist' });
    }
};
