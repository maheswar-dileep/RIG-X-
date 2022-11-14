const express = require('express');
const router = express.Router();
const controllers = require('../controllers/userController')
const productHelpers = require('../helpers/productHelpers')
const userHelpers = require('../helpers/userHelpers');
const OTP = require('../config/OTP');
const client = require('twilio')(OTP.accountSID, OTP.authToken)
const auth = require('../controllers/auth');
const { verifyUser } = require('../controllers/auth');



let nav = false
let footer = true;


/* GET home page. */
router.get('/', auth.verifyUser, controllers.landingPage);

/*------------------------login------------------------*/

router.get('/login', auth.mustLogout, controllers.userLogin)

router.post('/login', auth.mustLogoutAPI, controllers.userLoginPost)

/*------------------------signup------------------------*/

router.get('/signup', auth.mustLogout, controllers.userSignup)

router.post('/signup', auth.mustLogout)

/*------------------------OTP------------------------*/

router.get('/otp', auth.mustLogout, controllers.otpPage)

router.get('/otp-login/:id', auth.mustLogout, controllers.otpLoginPost);

router.get('/otp-verify', auth.mustLogout, controllers.otpVerify)

router.get('/shop', auth.verifyUser, controllers.shopPage);

router.get('/product/:id', auth.verifyUser, controllers.productPage)

router.get('/about-us', auth.verifyUser, controllers.aboutUsPage)

router.get('/wishlist', auth.verifyUser, controllers.wishlistPage)

//account
router.get('/account',auth.verifyUser,controllers.accountPage)

//cart

router.get('/cart', auth.verifyUser, controllers.cart)

//add to cart 

router.get('/add-to-cart/:id', auth.verifyUser, controllers.addToCart)

router.post('/change-product-quantity', auth.verifyUser, controllers.changeProductQuantity)

router.post('/delete-cart-item',auth.verifyUser,controllers.deleteCartItem)

//checkout

router.get('/checkout',auth.verifyUser,controllers.checkout)

//placeOrder

router.post('/place-order',auth.verifyUser,controllers.placeOrder)

//orders
router.get('/orders',verifyUser,controllers.ordersPage)

//cancelOrder

router.post('/user-order-cancel',auth.verifyUser,controllers.cancelOrder)

//success

router.get('/success',auth.verifyUser,controllers.success)

//getAddress

router.get('/autofill-address/:id',auth.verifyUser,controllers.getAddress)

router.get('/logout', controllers.userLogout)

module.exports = router;
