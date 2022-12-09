require('dotenv').config()

const productHelpers = require('../helpers/productHelpers');
const userHelpers = require('../helpers/userHelpers');
const couponHelpers = require('../helpers/couponHelpers');
const OTP = require('../config/OTP')
const client = require('twilio')(OTP.accountSID, OTP.authToken)
const db = require("../model/connection")
const bannerHelpers = require('../helpers/bannerHelpers')
const auth = require('../controllers/auth');
const razorPayKey = require('../config/razorpayKey')
const { Convert } = require("easy-currencies");

let nav = false;
let footer = true;

const paypal = require('@paypal/checkout-server-sdk')
const Environment =
    process.env.NODE_ENV === "production"
        ? paypal.core.LiveEnvironment
        : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
)

let couponPrice = 0

module.exports = {

    //landingPage

    landingPage: async (req, res, next) => {
        let banners = await bannerHelpers.banner()
        let categoryBanner = await bannerHelpers.categoryFind()
        let coolers = await productHelpers.categoryPage('COOLER')
        let keyboards = await productHelpers.categoryPage('KEYBOARD')
        let userName = req?.user?.name
        let products = await db.products.find({}).sort({ percent: -1 }).limit(8)
        let cartCount = await userHelpers?.getCartCount(req?.session?.user)
        res.render('index', {
            userName,
            banners,
            nav: true,
            footer: true,
            cartCount,
            keyboards,
            products,
            categoryBanner,
            coolers
        });
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
        res.render('user/otp-login', { nav: false, footer: false })
    },

    otpLoginPost: async (req, res) => {
        mobile = req.params.id?.trim();
        let userExists = await db.users.find({ mobile: mobile })
        if (userExists == 0) {
            res.json({ status: false })
        } else {
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
        }
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
                        res.send({ value: true })
                    });
                } else {
                    res.send({ value: false })
                }
            })
    },


    //shopPage

    shopPage: (req, res) => {
        let userName = req.user.name
        userHelpers.getCartCount(req.session.user).then((cartCount) => {
            productHelpers.getAllProducts().then((products) => {
                res.render('user/shop', { userName, cartCount, products, nav: true, footer: true })
            })
        })
    },

    //getProductData

    getProductData: async (req, res) => {
        let data = await db.products.find({})
        res.send(data)
    },

    //productPage

    productPage: (req, res) => {
        let userName = req.user.name
        let prodId = req.params.id
        userHelpers.getCartCount(req.session.user).then((cartCount) => {
            productHelpers.getProductDetails(prodId).then((product) => {
                res.render('user/single-product', { userName, cartCount, product, nav: true, footer: true })
            })
        })
    },

    //aboutUs

    aboutUsPage: (req, res) => {
        let userName = req.user.name
        res.render('user/about-us', { userName, nav: true, footer: true })
    },

    //wishlistPage

    wishlistPage: (req, res) => {
        let userName = req.user.name
        res.render('user/wishlist', { userName, nav: true, foooter: true })
    },

    //account

    accountPage: async (req, res) => {
        let userName = req.user.name
        let states = await userHelpers.getAllStates(req.session.user)
        let address = await userHelpers.getaddress(req.session.user)
        let cartCount = await userHelpers.getCartCount(req.session.user)
        let coupon = await couponHelpers.getCoupons()
        let walletBalance = await userHelpers.getWalletBalance()
        res.render('user/account', { nav: true, footer: true, userName, cartCount, address, states, walletBalance, coupon })
    },

    addToCart: (req, res) => {
        userHelpers.addToCart(req.params.id, req.session.user).then(() => {
            res.json({ status: true })
        })
    },

    cart: async (req, res) => {
        let userName = req?.user?.name
        let cartItems = await userHelpers.getCartProducts(req.session.user)
        let cartCount = await userHelpers.getCartCount(req.session.user)
        let total = await userHelpers.getTotalAmount(req.session.user)
        res.render('user/cart', { userName, cartCount, cartItems, total, nav: true, foooter: true })

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

    //checkCartQuantity

    checkCartQuantity: (req, res) => {
        // console.log('uId',req.session.user);
        userHelpers.checkCartQuantity(req.session.user, req.params.id).then((response) => {
            res.send(response)
        })
    },

    //checkout

    checkout: async (req, res) => {
        let userName = req.user.name
        let address = await userHelpers.getaddress(req.session.user)
        let states = await userHelpers.getAllStates()
        let total = await userHelpers.getTotalAmount(req.session.user)

        res.render('user/checkout', { paypalClientId: process.env.PAYPAL_CLIENT_ID, total, address, nav: true, foooter: true, userName, states })
    },

    //placeorder

    placeOrder: async (req, res) => {
        req.body.userId = req.session.user
        req.body.paymentStatus = 'pending'
        let total1 = await userHelpers.getTotalAmount(req.session.user)
        let total = total1 - couponPrice

        userHelpers.placeOrder(req.body, total).then(async (response) => {

            if (req.body.paymentMethod == 'COD') {
                res.json({ codstatus: true })
            } else if (req.body.paymentMethod == 'razorpay') {
                userHelpers.generateRazorPay(req.session.user, total).then((order) => {
                    res.json(order)
                })
            } else {
                res.json({ paypal: true, total: total })
            }
        })
    },

    //orders

    ordersPage: async (req, res) => {
        let userName = req.user.name
        let cartCount = await userHelpers.getCartCount(req.session.user)
        userHelpers.ordersDetails(req.session.user).then((orders) => {
            res.render('user/orders', { cartCount, nav: true, foooter: true, userName, orders })
        })
    },

    //cancelOrder

    cancelOrder: (req, res) => {
        userHelpers.cancelOrder(req.body, req.session.user).then(() => {
            res.json({ status: true })
        })
    },

    // returnProduct

    returnProduct: async (req, res) => {
        console.log(req.body.prodId);
        userHelpers.returnProduct(req.body, req.session.user).then((response) => {
            res.send(response)
        })

    },

    //paypal success

    paypalSuccess: async (req, res) => {
        // console.log('api');
        const ordersDetails = await db.order.find({ userId: req.session.user })
        let orders = ordersDetails[0].orders.slice().reverse()
        let orderId1 = orders[0]._id
        let orderId = "" + orderId1

        userHelpers.changePaymentStatus(req.session.user, orderId).then(() => {
            res.json({ status: true })
        })
    },


    //paypal order

    paypalOrder: async (req, res) => {
        let total = req.body.total
        total = parseInt(total)
        const request = new paypal.orders.OrdersCreateRequest()
        const value = await Convert(total).from("INR").to("USD");
        let price = Math.round(value)

        request.prefer("return=representation")
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: price,
                        breakdown: {
                            item_total: {
                                currency_code: "USD",
                                value: price,
                            },
                        },
                    }
                },
            ],
        })

        try {
            const order = await paypalClient.execute(request)
            res.json({ id: order.result.id })
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    },

    //success

    success: (req, res) => {
        res.render('user/success', { nav: false, foooter: false })
    },

    //getAddress

    getAddress: (req, res) => {
        let addrId = req.params.id
        userHelpers.getSingleAddress(addrId, req.session.user).then((data) => {
            res.json(data)
        })
    },

    //CheckStock

    checkStock: async (req, res) => {
        let prodId = req.params.id
        let products = await db.products.findOne({ _id: prodId })
        let quantity = products.quantity
        res.json({ stock: quantity })

    },

    //editAddress

    editAddress: async (req, res) => {
        userHelpers.editAddress(req.body, req.session.user).then((response) => {
            res.json(response)
        })
    },

    //verifyPayment

    verifyPayment: (req, res) => {
        userHelpers.verifyPayment(req.body).then(() => {
            // console.log(req.body);
            userHelpers.changePaymentStatus(req.session.user, req.body['order[receipt]']).then(() => {
                res.json({ status: true })
            })
        }).catch((err) => {
            res.json({ status: false })
        })
    },

    //ordersList

    ordersList: async (req, res) => {
        let userName = req.user.name
        let cartCount = await userHelpers.getCartCount(req.session.user)
        userHelpers.ordersList(req.session.user).then((orders) => {
            res.render('user/orders-list', { cartCount, nav: true, foooter: true, userName, orders })
        })
    },

    //addNewAddress

    addNewAddress: (req, res) => {
        userHelpers.addNewAddress(req.session.user, req.body).then((response) => {
            res.json(response)
        })

    },

    //deleteAddress

    deleteAddress: (req, res) => {
        userHelpers.deleteAddress(req.session.user, req.params.id).then((response) => {
            res.json(response)
        })
    },

    //orderInvoice

    orderInvoiceProducts: async (req, res) => {
        let orderId = req.query.orderId
        let prodId = req.query.product

        userHelpers.orderInvoice(orderId, prodId).then((response) => {
            res.json(response)
        })
    },

    categoryPage: async (req, res) => {
        let category = req.query.category
        let userName = req?.user?.name
        let cartCount = await userHelpers?.getCartCount(req.session.user)
        productHelpers.categoryPage(category).then((data) => {
            res.render('user/category-page', {
                cartCount,
                nav: true,
                foooter: true,
                 userName,
                data
            })
        })
    },

    shopCategoryPage: async (req, res) => {
        let userName = req.user.name
        let cartCount = await userHelpers.getCartCount(req.session.user)
        res.render('user/shop-category', { cartCount, nav: true, foooter: true, userName, })
    },

    //couponValidator

    couponValidator: async (req, res) => {
        let code = req.query.code
        couponHelpers.couponValidator(code, req.session.user).then((response) => {
            res.send(response)
        })
    },
    couponVerify: async (req, res) => {
        let code = req.query.code
        couponHelpers.couponVerify(code, req.session.user).then((response) => {
            res.send(response)
        })
    },
    applyCoupon: async (req, res) => {
        let code = req.query.code
        let total = await userHelpers.getTotalAmount(req.session.user)
        couponHelpers.applyCoupon(code, total).then((response) => {
            couponPrice = response.discountAmount ? response.discountAmount : 0
            console.log(response);
            res.json(response)
        })
    },

    //logout

    userLogout: (req, res) => {
        req.session.user = null;
        res.redirect('/login');
    }




}