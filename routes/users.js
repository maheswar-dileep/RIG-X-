const express = require('express');
const router = express.Router();
const controllers = require('../controllers/userController')
const productHelpers = require('../helpers/productHelpers')
const userHelpers = require('../helpers/userHelpers');
const OTP = require('../config/OTP');
const client = require('twilio')(OTP.accountSID, OTP.authToken)
const auth = require('../controllers/auth');
const { verifyUser } = require('../controllers/auth');


/* GET home page. */
router.get('/', controllers.landingPage);

/*------------------------login------------------------*/

router.get('/login', auth.mustLogout, controllers.userLogin)

router.post('/login', auth.mustLogoutAPI, controllers.userLoginPost)

/*------------------------signup------------------------*/

router.get('/signup', auth.mustLogout, controllers.userSignup)

router.post('/signup', auth.mustLogout, controllers.userSignupPost)

/*------------------------OTP------------------------*/

router.get('/otp', auth.mustLogout, controllers.otpPage)

router.get('/otp-login/:id', auth.mustLogout, controllers.otpLoginPost);

router.get('/otp-verify', auth.mustLogout, controllers.otpVerify)

/*------------------------pages------------------------*/

router.get('/getProductData', controllers.getProductData)

/*------------------------pages------------------------*/

router.get('/shop', controllers.shopPage);

router.get('/product/:id', controllers.productPage)

router.get('/about-us', auth.verifyUser, controllers.aboutUsPage)

router.get('/wishlist', auth.verifyUser, controllers.wishlistPage)

/*------------------------account------------------------*/

router.get('/account', auth.verifyUser, controllers.accountPage)

/*------------------------cart------------------------*/

router.get('/cart', auth.verifyUser, controllers.cart)

/*------------------------checkstock------------------------*/

router.get('/check-stock/:id', auth.verifyUser, controllers.checkStock)

/*------------------------Cart functions------------------------*/

router.get('/add-to-cart/:id', auth.verifyUser, controllers.addToCart)

router.put('/change-product-quantity', auth.verifyUser, controllers.changeProductQuantity)

router.delete('/delete-cart-item', auth.verifyUser, controllers.deleteCartItem)

router.get('/check-cart-quantity/:id',auth.verifyUser,controllers.checkCartQuantity )

/*------------------------Checkout------------------------*/

router.get('/checkout', auth.verifyUser, controllers.checkout)

/*------------------------PlaceOrder------------------------*/

router.post('/place-order', auth.verifyUser, controllers.placeOrder)

/*------------------------Orders------------------------*/

router.get('/orders', verifyUser, controllers.ordersPage)

/*------------------------cancelOrder------------------------*/

router.put('/user-order-cancel', auth.verifyUser, controllers.cancelOrder)

/*---------------------------returnOrder----------------------*/

router.put('/return-product', auth.verifyUser,controllers.returnProduct)

/*------------------------PaypalOrder------------------------*/

router.post('/create-order', auth.verifyUser, controllers.paypalOrder)

/*------------------------PaypalSuccess------------------------*/

router.get('/paypal-success',auth.verifyUser,controllers.paypalSuccess)

/*------------------------OrderSuccess------------------------*/

router.get('/success', auth.verifyUser, controllers.success)

/*-------------------------getAddress-------------------------*/

router.get('/autofill-address/:id', auth.verifyUser, controllers.getAddress)

/*------------------------NewAddress------------------------*/

router.post('/add-new-address', auth.verifyUser, controllers.addNewAddress)

/*-----------------------editAddress------------------------*/

router.put('/edit-address', auth.verifyUser, controllers.editAddress)

/*------------------------delete-address--------------------*/

router.get('/delete-address/:id', auth.verifyUser, controllers.deleteAddress)

/*------------------------verifyPayment---------------------*/

router.post('/verify-payment', auth.verifyUser, controllers.verifyPayment)

/*----------------------orders list-------------------------*/

router.get('/orders-list', auth.verifyUser, controllers.ordersList)

/*-------------------------invoice-----------------------------*/

router.get('/order-invoice-products',auth.verifyUser,controllers.orderInvoiceProducts)

/*--------------------------category-page-------------------------*/

router.get('/category',controllers.categoryPage)

/*--------------------------shop-by-category-page-------------------------*/

router.get('/shop-category',controllers.shopCategoryPage)

/*-----------------------------coupon-validator-------------------------------*/ 

router.get('/coupon-validator',auth.verifyUser,controllers.couponValidator)

router.get('/coupon-verify',auth.verifyUser,controllers.couponVerify)

router.get('/apply-coupon',auth.verifyUser,controllers.applyCoupon)

//logout

router.get('/logout', controllers.userLogout)

module.exports = router;
