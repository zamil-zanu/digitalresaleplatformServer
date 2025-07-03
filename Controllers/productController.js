const products = require('../Model/productModel');
const users = require('../Model/userModel')
// 1.List a product (by logged-in user)
exports.AddProductController = async (req, res) => {
    console.log("inside list product controller");
    try {
        const { product_name, description, price, stock, category, condition } = req.body
        const images = req.file.filename
        const sellerId = req.userId
        const product = new products({
            product_name,
            description,
            price,
            category,
            images,
            seller: sellerId,
            condition,
            stock
        })
        // save 
        await product.save()
        // Push the new product's _id into the seller's ProductsListed
        await users.findByIdAndUpdate(sellerId, { $push: { ProductsListed: product._id } }, { new: true })
        res.status(200).json({ message: "Product added successfully", product })
    } catch (err) {
        res.status(500).json({ message: "Server error" })
    }

}

//2.get user products

exports.getUserProductsController = async (req, res) => {
    console.log("inside get user products controller");
    try {
        const sellerId = req.userId
        const getuserproductdetails = await products.find({ seller: sellerId })
        res.status(200).json(getuserproductdetails)

    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }

}

// 3.get all products

exports.getAllProductsController = async (req, res) => {
    console.log("inside getAllProductsController");

    try {
        const allproducts = await products.find().populate('seller', 'username email')
        res.status(200).json(allproducts)

    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

//4. get single product details
exports.getSingleProductController = async (req, res) => {
    console.log("inside getSingleProductController");
    const { id } = req.params
    try {

        const singleproduct = await products.findById(id).populate('seller', 'username email _id')
        res.status(200).json(singleproduct)
    }
    catch (err) {
        res.status(500).json(err)
    }

}

// 5. update product details (seller only)
exports.updateProductDetailsController = async (req, res) => {
    try {
        const userId = req.userId
        const { pid } = req.params;
        const { product_name, description, price, stock, category, condition, status } = req.body
        const images = req.file.filename
        const updates = {
            product_name,
            description,
            price,
            stock,
            category,
            condition,
            status,
            images
        }
        const product = await products.findOneAndUpdate({ _id: pid, seller: userId }, updates, { new: true })
        if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' })
        res.status(200).json({ message: 'Product updated successfully', product })
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" })
    }
}
// 6. delete product (for seller(user) and admin only)
exports.deleteProductController = async (req, res) => {
    try {
        const { pid } = req.params
        const userId = req.userId
        // userRole  from jwtMiddleware
        const userRole = req.userRole

        // Base query: product must match this _id
        let query = { _id: pid }

        // If user is not an admin, restrict to their own product(admin allenkil 'query' lek 'seller' key with 'userId' as value, so that this delete function is for admin and seller only )
        if (userRole !== 'admin') {
            query.seller = userId
        }
        const product =await products.findOneAndDelete(query)

        if (!product) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }
        res.status(200).json({ message: "Product deleted successfully" })
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" })
    }
}










//  --------------------- below for deletion-------------------------------

// Update product details (Seller only)
exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const updates = req.body;
        const product = await Product.findOneAndUpdate({ _id: productId, seller: req.user.id }, updates, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });
        res.json({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('seller', 'name email');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get product details
exports.getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId).populate('seller', 'name email');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// Delete a product (Seller or Admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findOneAndDelete({ _id: productId, seller: req.user.id });
        if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
// Get all approved products (public)
exports.getAllApprovedProducts = async (req, res) => {
    const products = await Product.find({ status: 'approved' }).populate('seller', 'name');
    res.status(200).json(products);
};

// Admin: Get all pending products
exports.getPendingProducts = async (req, res) => {
    const pending = await Product.find({ status: 'pending' });
    res.status(200).json(pending);
};

// Admin: Approve/Reject product
exports.changeProductStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // approved or rejected
    await Product.findByIdAndUpdate(id, { status });
    res.status(200).json({ message: `Product ${status}` });
};