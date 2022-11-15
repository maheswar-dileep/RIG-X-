const productHelpers = require('../helpers/productHelpers');
const userHelpers = require('../helpers/userHelpers');
const OTP = require('../config/OTP')
const client = require('twilio')(OTP.accountSID, OTP.authToken)
const db = require("../model/connection")
const auth = require('../controllers/auth');
const { response } = require('../app');
const { state } = require('../model/connection');

let nav = false;
let footer = true;



module.exports = {

    //landingPage

    landingPage: (req, res, next) => {
        let user = req.user.name
        console.log(user);
        userHelpers.getCartCount(req.session.user).then((cartCount) => {
            res.render('index', { user, nav: true, footer: true, cartCount });
        })
    },

    //login

    userLogin: (req, res) => {
        res.render('user/user-login', { nav, footer: false })
    },

    userLoginPost: (req, res) => {
        userHelpers.doLogin(req.body).then((data) => {
            if (data.status) {
                req.session.user = data.user._id
                res.send({ value: "success" })
            } else {
                res.send({ value: "failed" })
            }
        })
    },

    //signup

    userSignup: (req, res) => {
        res.render('user/signup', { nav: true, footer: false })
    },

    userSignupPost: (req, res) => {
        userHelpers.doSignup(req.body).then((data) => {
            if (data.status) {
                req.session.user = data.user._id
                res.send({ value: "success" })
            } else {
                res.send({ value: "account already exists" })
            }
        })
    },

    //OTP

    otpPage: (req, res) => {
        res.render('user/otp-login', { nav: false, footer: true })
    },

    otpLoginPost: (req, res) => {
        mobile = req.params.id?.trim();

        client
            .verify
            .services(OTP.serviceId)
            .verifications
            .create({
                to: `+91${mobile}`,
                channel: 'sms'
            }).then((data) => {
                res.status(200).res.send(data)
            })

    },

    otpVerify: (req, res) => {

        client
            .verify
            .services(OTP.serviceId)
            .verificationChecks
            .create({
                to: `+${req.query.mobileNumber}`,
                code: req.query.code
            }).then((data) => {
                if (data.valid) {
                    mobile = req.query.mobileNumber.slice(2);
                    userHelpers.getUserDetailsNo(mobile).then(user => {
                        req.session.user = user[0]._id;
                        res.send({ value: 'success' })
                    });
                } else {
                    res.send({ value: 'failed' })
                }
            })
    },


    //shopPage

    shopPage: (req, res) => {
        userHelpers.getCartCount(req.session.user).then((cartCount) => {
            productHelpers.getAllProducts().then((products) => {
                res.render('user/shop', { cartCount, products, nav: true, footer: true })
            })
        })
    },


    //productPage

    productPage: (req, res) => {
        let prodId = req.params.id
        userHelpers.getCartCount(req.session.user).then((cartCount) => {
            productHelpers.getProductDetails(prodId).then((product) => {
                res.render('user/single-product', { cartCount, product, nav: true, footer: true })
            })
        })
    },

    //aboutUs

    aboutUsPage: (req, res) => {
        res.render('user/about-us', { nav: true, footer: true })
    },

    //wishlistPage

    wishlistPage: (req, res) => {
        res.render('user/wishlist', { nav: true, foooter: true })
    },

    //account

    accountPage: async (req, res) => {
        let cartCount = await userHelpers.getCartCount(req.session.user)
        res.render('user/account', { nav: true, footer: true, cartCount })
    },

    addToCart: (req, res) => {
        userHelpers.addToCart(req.params.id, req.session.user).then(() => {
            res.json({ status: true })
        })
    },

    cart: (req, res) => {
        userHelpers.getTotalAmount(req.session.user).then((total) => {
            userHelpers.getCartCount(req.session.user).then((cartCount) => {
                userHelpers.getCartProducts(req.session.user).then((cartItems) => {
                    res.render('user/cart', { cartCount, cartItems, total, nav: true, foooter: true })
                })
            })
        })
    },

    changeProductQuantity: (req, res) => {
        userHelpers.changeProductQuantity(req.body).then(async (response) => {
            response.total = await userHelpers.getTotalAmount(req.session.user)
            res.json(response)
        })
    },

    deleteCartItem: (req, res) => {
        userHelpers.deleteCartItem(req.body).then((response) => {
            res.json(response)
        })
    },

    //checkout

    checkout: async (req, res) => {
        let address = await userHelpers.getaddress(req.session.user)
        let states = await userHelpers.getAllStates()
        let total = await userHelpers.getTotalAmount(req.session.user)
        res.render('user/checkout', { total, address, nav: true, foooter: true, states })
    },

    //placeorder

    placeOrder: async (req, res) => {
        req.body.userId = req.session.user
        let total = await userHelpers.getTotalAmount(req.session.user)
        userHelpers.placeOrder(req.body, total).then((response) => {
            res.json(response)
        })
    },

    //orders

    ordersPage: async (req, res) => {
        let cartCount = await userHelpers.getCartCount(req.session.user)
        userHelpers.ordersDetails(req.session.user).then((orders) => {
            res.render('user/orders', { cartCount, nav: true, foooter: true, orders })
        })
    },

    //cancelOrder

    cancelOrder: (req, res) => {
        userHelpers.cancelOrder(req.body).then((data) => {
            res.json(data)
        })
    },

    //success

    success: (req, res) => {
        res.render('user/success', { nav: false, foooter: false })
    },

    //getAddress

    getAddress: (req, res) => {
        let addrId = req.params.id
        userHelpers.getSingleAddress(addrId, req.session.user).then((data)=>{
            res.json(data)
        })
    },






    //logout

    userLogout: (req, res) => {
        req.session.user = null;
        res.redirect('/login');
    }



}