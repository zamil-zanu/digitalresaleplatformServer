const users = require('../Model/userModel')
const products = require('../Model/productModel')
const orders = require('../Model/orderModel')
const transactions = require('../Model/transactionModel')
const reports = require('../Model/reportModel')

// get all users
exports.getAllUsersController = async (req, res) => {
    try {
        const allUsers = await users.find({ role: 'user' }).select('-password')
        if (!allUsers) return res.status(404).json({ message: "Users not found" });
        res.status(200).json(allUsers)
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" })
    }
}
// List all users who have listed products (i.e. potential sellers)
exports.getAllSellersController = async (req, res) => {
    try {
        const sellers = await users.find({
            ProductsListed: { $exists: true, $not: { $size: 0 } }
        })
            .select('username email isVerified ProductsListed');
        res.json(sellers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify or unverify a seller (by isVerified to true/ false)
exports.verifySellerController = async (req, res) => {
    console.log("inside verify seller controller");

    const { userID, verify } = req.body; // expect { verify: true } or { verify: false }
    try {
        const user = await users.findById(userID);
        if (!user) return res.status(404).json({ message: 'Seller not found' });

        user.isVerified = verify === true;
        await user.save();

        res.json({
            message: `Seller ${user.isVerified ? 'verified' : 'unverified'}`,
            user: { id: user._id, isVerified: user.isVerified }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// approve/ unapprove a product (veriy product by isApproved true/false)
exports.toggleProductApprovalController = async (req, res) => {
    console.log("inside toggle product approval");
    const { productId, Approve } = req.body
    console.log(req.body);

    try {
        const product = await products.findById(productId)
        if (!product) return res.status(404).json({ message: 'Product not found' })
        product.isApproved = Approve === true;
        await product.save()
        res.status(200).json({ id: product._id, approvalStatus: product.isApproved })
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" })
    }
}

// After product snapshot
// fetch all orders
exports.getAllOrdersController = async (req, res) => {
    console.log("inside get all orders controller");

    try {
        const allOrders = await orders.find().populate('user', 'username email')
        res.status(200).json(allOrders)
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" })
    }
}

// update order status
exports.updateOrderStatusController = async (req, res) => {
    console.log("inside update order status controller");

    const { orderId } = req.params
    const { orderStatus } = req.body // expects 'Pending','Shipped','Delivered'
    if (!['Pending', 'Shipped', 'Delivered', 'Out for Delivery','Cancelled'].includes(orderStatus)) {
        return res.status(400).json({ message: "Invalid Status" })
    }
    try {
        const order = await orders.findById(orderId)
        order.orderStatus = orderStatus;
        await order.save()
        res.status(200).json({ message: "Order Status Updated", order })

    }
    catch (err) {
        res.status(500).json({ message: "Server Error" })
    }
}

// ban or unban user / Toggle ban status
exports.toggleBanUserController = async (req, res) => {
    console.log("inside toggle ban user");

    const { userId } = req.params;
    const { ban } = req.body;    // { ban: true } or { ban: false }
    try {
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isBanned = ban === true;
        await user.save();

        res.status(200).json({
            message: `User ${user.isBanned ? 'banned' : 'un‑banned'}`,
            user: { id: user._id, isBanned: user.isBanned }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// get all transactions

exports.getAllTransactionsController = async (req, res) => {
    console.log("inside getAllTransactionController");
    try {
        const allTransactions = await transactions.find()
        res.status(200).json(allTransactions);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch transactions" });
    }
};

// get all reports

exports.getAllReportsController = async (req, res) => {
    console.log("inside getAllReportsController");
    try {
        const allReports = await reports.find()
        res.status(200).json(allReports)
    }
    catch (err) {
        res.status(401).json({ message: "Failed to fetch reports" })
    }
}
// update report status

exports.updateReportStatusController = async (req, res) => {
    console.log("inside updateReportStatusController");
    const { reportId } = req.body
    try {
        const report = await reports.findById(reportId)
        report.status = "Resolved"
        await report.save()
        res.status(200).json(report)
    }
    catch (err) {
        res.status(401).json({ message: "Failed to fetch reports" })
    }

}

// delete report
exports.deleteReportController = async (req, res) => {
    console.log("inside deleteReportController");
    const { reportId } = req.body
    try {
        const report = await reports.findByIdAndDelete(reportId)
        res.status(200).json(report)
    }
    catch (err) {
        res.status(401).json({ message: "Failed to Delete" })
    }

}

// get monthly sales
exports.getMonthlySalesController = async (req, res) => {
    console.log("inside getMonthlySalesController");

    try {
        const monthlySales = await transactions.aggregate([
            {
                $match: { paymentStatus: "Paid" }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalSales: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }  // Jan = 1, Feb = 2, ...
        ])
        // Fill missing months with 0
        // to convert into 0 indexed array slot
        const result = Array(12).fill(0);
        monthlySales.forEach(sale => {
            result[sale._id - 1] = sale.totalSales
        })
        res.status(200).json(result)  // [Jan, Feb, ..., Dec] corresponding month nte total sales (array of numbers)

    } catch (err) {
        res.status(500).json({ message: "Error fetching sales data" })
    }
}

exports.getTotalSalesRevenueController = async (req, res) => {
    console.log("inside getTotalSalesRevenueController");
    try {
        const paidOrders = await orders.find({ paymentStatus: "Paid" });

        let totalRevenue = 0;
        let totalSales = 0;

        paidOrders.forEach(order => {
            totalRevenue += order.totalAmount;
            order.products.forEach(item => {
                totalSales += item.quantity;
            });
        });

        res.status(200).json({ totalRevenue, totalSales });
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching total sales and revenue" });
    }

}