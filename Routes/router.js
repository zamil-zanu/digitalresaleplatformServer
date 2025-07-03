const express = require('express')
const router = new express.Router()
const { registerController, loginController } = require('../Controllers/authController')
const { AddProductController, getUserProductsController, getAllProductsController, getSingleProductController, getPendingProducts, changeProductStatus, updateProductDetailsController, deleteProductController } = require('../Controllers/productController')
const { jwtMiddleware, adminOnlyMiddleware } = require('../middlewares/authMiddleware')
const multerMiddleware = require('../middlewares/multerMiddleware')
const { addToWishlistController, getWishlistController, removeWishlistItemController } = require('../Controllers/wishlistController')
const { addToCartController, getCartItemsController, removeCartItemController, clearCartController, updateCartController } = require('../Controllers/cartController')
const { updateUserProfileController, getUserProfileController, getSellerProfileController, changePasswordController } = require('../Controllers/userProfileController')
const { placeOrderController, getUserOrdersController, cancelOrderController } = require('../Controllers/orderController')
const { getAllSellersController, verifySellerController, toggleProductApprovalController, getAllOrdersController, updateOrderStatusController, toggleBanUserController, getAllTransactionsController, getAllReportsController, updateReportStatusController, deleteReportController, getAllUsersController, getMonthlySalesController, getTotalSalesRevenueController } = require('../Controllers/adminController')
const { razorpayController, verifyPaymentController } = require('../Controllers/razorpayPaymentController')
const { createReportController } = require('../Controllers/reportController')
const { getChatHistoryController, getLastMessageController, getChatPartnersController, uploadChatImagesController, getUnreadMessageCountController } = require('../Controllers/messageController')


// ------------------AUTH----------------------------

// 1.register
router.post('/register', registerController)
// 2.login
router.post('/login', loginController)


// -----------------PRODUCT---------------------------

// 1. list a product by user
router.post('/add-product', jwtMiddleware, multerMiddleware.single('images'), AddProductController)

// 2. get user product details
router.get('/get-user-products', jwtMiddleware, getUserProductsController)

// 3. get all products details,

router.get('/get-all-products', getAllProductsController)

// 4. get single product details
router.get('/productpage/:id', getSingleProductController)

// 5. update product details (seller only)
router.put('/update-product-details/:pid', jwtMiddleware, multerMiddleware.single('images'), updateProductDetailsController)

// 6. delete product
router.delete('/delete-product/:pid', jwtMiddleware, deleteProductController)

// ---------------- WISHLIST-----------------------

// 1.add to wishlist 
router.post('/wishlist', jwtMiddleware, addToWishlistController)

// 2.get from wishlist
router.get('/wishlist', jwtMiddleware, getWishlistController)

// 3.remove wishlistitem
router.delete('/wishlist/:productId', jwtMiddleware, removeWishlistItemController)

// ---------------CART-------------

//  1. add to cart
router.post('/cart', jwtMiddleware, addToCartController)

//  2. get all items from cart
router.get('/cart', jwtMiddleware, getCartItemsController)

//  3. remove cart item
router.delete('/cart/:productId', jwtMiddleware, removeCartItemController)

//  4. clear entire cart
router.delete('/clear-cart', jwtMiddleware, clearCartController)

// 5. update cart details
router.put('/update-cart', jwtMiddleware, updateCartController)

// ------------------USER PROFILE ---------------------

// 1. update user profile
router.put('/update-user-profile', jwtMiddleware, multerMiddleware.single('profilePic'), updateUserProfileController)

// 2. get user profile
router.get('/user-profile', jwtMiddleware, getUserProfileController)

// 3.get seller profile(for messaging page)
router.get('/get-seller-profile/:sellerId',getSellerProfileController)

// 4.change password
router.put('/change-password',jwtMiddleware,changePasswordController)

// ----------------------ORDER---------------------

// 1. place order 
router.post('/place-order', jwtMiddleware, placeOrderController)

// 2. get user orders 
router.get('/get-user-orders', jwtMiddleware, getUserOrdersController)

// 3. cancel order 
router.put('/cancel-order/:orderId',jwtMiddleware,cancelOrderController)


//-----------------------REPORT------------------------

//1.create report
router.post('/create-report', jwtMiddleware, createReportController)



// --------------------ADMIN--------------------------

// 1. get all users
// for some time [adminOnlyMiddleware,] i remove this to do socket io messaging il users ne kittan
router.get('/admin/get-all-users', jwtMiddleware, getAllUsersController)

// 2. get all sellers
router.get('/admin/get-all-sellers', jwtMiddleware, adminOnlyMiddleware, getAllSellersController)

// 3. verify seller (using 'patch'http method)(by isVerified to true/false)
router.patch('/admin/verify-seller', jwtMiddleware, adminOnlyMiddleware, verifySellerController)

// 4. approve product(verify product by isApproved to true/false)(toggle product approval)
router.patch('/admin/approve-product', jwtMiddleware, adminOnlyMiddleware, toggleProductApprovalController)

// 5. get all orders
router.get('/admin/get-all-orders', jwtMiddleware, getAllOrdersController)

// 6. update order status (using patch method)
router.patch('/admin/update-order-status/:orderId', jwtMiddleware, adminOnlyMiddleware, updateOrderStatusController)

// 7. ban/ unban user or toggle ban user
router.patch('/admin/toggle-ban-user/:userId', jwtMiddleware, adminOnlyMiddleware, toggleBanUserController)

// 8. get all reports
router.get('/admin/get-all-reports', jwtMiddleware, getAllReportsController)

// 9. update report status
router.put('/admin/update-report-status', jwtMiddleware, updateReportStatusController)

// 10. delete report
router.delete('/admin/delete-report', jwtMiddleware, deleteReportController)

//11. get monthly sales
router.get('/admin/get-monthly-sales', jwtMiddleware, getMonthlySalesController)

// 12. get total sales and revenue
router.get('/admin/get-total-sales-revenue', jwtMiddleware, getTotalSalesRevenueController)


// ---------RAZORPAY ROUTE----------------------

//  set razorpay route
router.post('/api/payment/create-order', razorpayController)
//  verify payment route
router.post('/api/payment/verify', verifyPaymentController)

// 8. get all transactions
router.get('/admin/get-all-transactions', jwtMiddleware, adminOnlyMiddleware, getAllTransactionsController)



// ------------------SOCKET OI-------------------------

// 1.get chat history
router.get('/api/get-chat-history/:roomId', getChatHistoryController)

// 2.get last message
// router.get('/api/get-last-message/:roomId', getLastMessageController)

//3.get chat partners 
router.get('/api/get-chat-partners', jwtMiddleware, getChatPartnersController)

// posting new message and saving to mongodb we already did inside chatSocket.js without api call (and also send that message to receiver )

// 4. upload multiple images (upto 5) in messages
router.post('/chat/upload-images',jwtMiddleware,multerMiddleware.array("images",5),uploadChatImagesController)

// get unread msg count
router.get('/chat/get-unread-message-count',jwtMiddleware,getUnreadMessageCountController)










module.exports = router