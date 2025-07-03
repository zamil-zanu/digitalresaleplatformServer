const orders = require('../Model/orderModel')
const users = require('../Model/userModel')
// place order controller
exports.placeOrderController = async (req, res) => {
    const userId = req.userId
    const { products, totalAmount, shippingDetails, paymentMethod, paymentStatus, orderStatus } = req.body

    try {

        const newOrder = new orders({
            user: userId,
            products,  // no changes for product snapshot needed here
            totalAmount,
            shippingDetails,
            paymentMethod,
            paymentStatus,
            orderStatus
            // no need to mention estimatedDelivery here
        })
        await newOrder.save()

        // changes
        const currentUser = await users.findById(userId)
        currentUser.orders.push(newOrder._id)
        await currentUser.save()

        return res.status(200).json(newOrder)
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" })
    }

}

// get user orders controller
exports.getUserOrdersController = async (req, res) => {
    console.log("inside get user orders controller");

    const userId = req.userId
    try {
        const user = await users.findById(userId).populate('orders')
        const userOrders = user.orders
        res.status(200).json(userOrders)
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" })
    }

}

// cancel order (by user)
exports.cancelOrderController = async (req, res) => {
    console.log("inside cancelOrderController");
 
    const { orderId } = req.params;
    console.log(orderId);
    

    try {
        const order = await orders.findById(orderId);
        if (!order)
            return res.status(404).json({ message: 'Order not found' });

        // Only pending orders can be cancelled
        if (order.orderStatus !== 'Pending')
            return res.status(400).json({ message: 'Cannot cancel after processing' });

        order.orderStatus = 'Cancelled';
        order.cancelledAt = new Date();

        // determine refund eligibility:
        // only if payment was captured, and within 7 days
        const paid = order.paymentStatus === 'Paid';
        const withinWindow = (Date.now() - order.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000;
        order.eligibleForRefund = paid && withinWindow;

        await order.save();
        res.json({ message: 'Order cancelled', order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};