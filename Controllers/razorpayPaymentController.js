const Razorpay = require('razorpay')
const crypto = require('crypto')
const orders = require('../Model/orderModel')
const transactions=require('../Model/transactionModel')
// step-1 : create razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// step-2: set up controller for razorpay route

exports.razorpayController = async (req, res) => {
    const { amount, currency } = req.body
    try {
        const options = {
            amount: amount * 100,
            currency: currency || 'INR'
        }
        const razorpayOrder = await razorpayInstance.orders.create(options)
        res.status(200).json({ razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency })
    }
    catch (err) {
        console.log(err);
        res.status(500).json("Error creating Razorpay order")
    }
}


// verify payment controller

exports.verifyPaymentController = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, userId, totalAmount } = req.body

    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex')

    if (generatedSignature == razorpay_signature) {
        try {
            // Save in transaction model
            const newTransaction=new transactions({
                order:orderId,
                user:userId,
                amount:totalAmount,
                paymentMethod:'Razorpay',
                paymentStatus:'Paid',
                transactionId:razorpay_payment_id,
            })
            await newTransaction.save()
            // Update order status
            const updateOrder = await orders.findByIdAndUpdate(orderId, { paymentStatus: 'Paid' }, { new: true })
            res.status(200).json({ success: true, message: 'Payment Successful' })
        }
        catch (err) {
            res.status(500).json("Database error")
        }

    } else {
        res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
}