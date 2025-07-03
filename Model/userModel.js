const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    profilePic: {
        type: String
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    }],
    cart: [{
        productID: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
        quantity: { type: Number, default: 1 }
    }],
    ProductsListed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' } })


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
const users = mongoose.model("users", userSchema)
module.exports = users