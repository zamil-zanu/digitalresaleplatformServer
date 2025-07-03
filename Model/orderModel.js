const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    products: [{
        objectID: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
        // changes for product snapshot
        productSnapshot: {
            name: String,
            price: Number,
            description: String,
            images: String,
            seller: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            category: String,
            condition: String
        },
        quantity: Number
    }],
    totalAmount: Number,
    shippingDetails: {
        name: String,
        email: String,
        phone: String,
        address: String
    },
    paymentMethod: String,
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Failed'],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: ['Shipped', 'Pending', 'Delivered', 'Out for Delivery', 'Cancelled'],
        default: 'Pending'
    },
    estimatedDelivery: {
        type: Date,
        default: () => {
            // 5 days (in ms) from now:
            return new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        }
    },
    cancelledAt: Date,
    // ────────────── NEW ──────────────
    eligibleForRefund: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const orders = mongoose.model("orders", orderSchema)
module.exports = orders