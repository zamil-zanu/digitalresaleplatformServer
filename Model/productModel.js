const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    images: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    condition: {
        type: String,
        enum: ['New', 'Used', 'Like New', 'Refurbished'],
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 1
    },
    status: {
        type: String,
        enum: ['Available', 'Sold'],
        default: 'Available'

    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })
const products = mongoose.model("products", productSchema)
module.exports = products