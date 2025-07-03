const users = require("../Model/userModel");

// add to cart 
exports.addToCartController = async (req, res) => {
    console.log("inside add to cart controller");
    const userId = req.userId
    const { productId, quantity } = req.body
    try {
        const user = await users.findById(userId)
        const existingItem = user.cart.find(item => item.productID.toString() === productId)
        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            user.cart.push({ productID: productId, quantity })
        }
        await user.save()
        // res.status(200).json(user.cart)

        // difference from previous logic:- below only
        const populatedUser = await users.findById(userId).populate('cart.productID')
        const populatedItem = populatedUser.cart.find(item => item.productID._id.toString() === productId)
        res.status(200).json(populatedItem)   // 🛠 Send only the changed/added item

    }
    catch (err) {
        res.status(500).json("Error adding to cart")
    }
}

// get items from cart
exports.getCartItemsController = async (req, res) => {
    console.log("inside get cart items controller");

    const userId = req.userId
    try {
        const user = await users.findById(userId).populate('cart.productID')
        res.status(200).json(user.cart)
    }
    catch (err) {
        res.status(500).json({ message: "Server error" })
    }
}

// remove item from cart
exports.removeCartItemController = async (req, res) => {
    console.log("inside removeCartItemController");

    const userId = req.userId;
    const { productId } = req.params;

    try {
        const user = await users.findById(userId);
        // Check if any cart item matches the productId
        const itemExists = user.cart.some(item => item.productID.toString() === productId);

        if (itemExists) {
            // Remove the matching item
            user.cart = user.cart.filter(item => item.productID.toString() !== productId);
            await user.save(); // Save the changes
            // res.status(200).json(user.cart);
            
            // difference from previous code
            res.status(200).json({ removedProductId: productId })   // 🛠 Only send removed ID

        } else {
            console.log("No product with that product id");
            res.status(404).json({ message: "No product with that product id" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error removing from cart" });
    }
}

// clear entire cart
exports.clearCartController = async (req, res) => {
    const userId = req.userId
    try {
        const user = await users.findById(userId)
        user.cart = []
        await user.save()
        res.status(200).json(user.cart)
    }
    catch (err) {
        res.status(500).json({ message: "Error clearing cart" })
    }
}

// update final cart details (with latest quantity)
exports.updateCartController = async (req, res) => {
    const userId = req.userId
    const { cartItems } = req.body
    try {
        const user = await users.findById(userId)
        // Update the cart
        user.cart = cartItems
        await user.save()
        console.log(user.cart);

        res.status(200).json(user.cart)
    }
    catch (err) {
        res.status(500).json({ message: "Error updating cart details" })
    }
}



//note: change controllers acc to redux
