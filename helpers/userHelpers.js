const db = require("../model/connection")
const bcrypt = require('bcrypt')
const { response } = require("../app")
const { userid } = require("../config/admin_pass")
const { address, products } = require("../model/connection")
const { cancelOrder } = require("../controllers/userController")
const ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const razorPayKey = require('../config/razorpayKey')
const paypalKey = require('../config/paypalKey')
const { default: mongoose } = require("mongoose")
const { resolve } = require("path")


var instance = new Razorpay({
    key_id: razorPayKey.keyId,
    key_secret: razorPayKey.secretKey,
});

module.exports = {


    doSignup: (userData) => {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                db.users.find({ email: userData.email }).then(async (user) => {

                    if (user.length == 0) {

                        userData.password = await bcrypt.hash(userData.password, 10)
                        let data = await db.users(userData)
                        data.save()
                        response.user = data
                        response.status = true
                        resolve(response)

                    } else {
                        resolve({ status: false })
                    }

                })
            } catch (err) {
                console.log(err);
            }

        })
    },

    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                let user = await db.users.findOne({ email: userData.email })
                if (user) {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            resolve({ status: false })
                        }
                    })
                } else {
                    resolve({ status: false })
                }
            } catch (err) {
                console.log(err);
            }
        })
    },

    getUserDetailsNo: (mobileNumber) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.users.find({ mobile: mobileNumber }).then(async (user) => {
                    resolve(user)
                })
            } catch (err) {
                console.log(err)
            }
        })
    },

    addToCart: (prodId, userId) => {

        let proObj = {
            products: prodId,
            quantity: 1
        }

        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.cart.findOne({ user: userId })
                if (userCart) {

                    let proExist = userCart.cartItems.findIndex(cartItems => cartItems.products == prodId)

                    if (proExist != -1) {
                        db.cart.updateOne({ 'user': userId, 'cartItems.products': prodId }, {
                            $inc: { 'cartItems.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                    } else {
                        db.cart.updateOne({ user: userId }, {
                            $push: {
                                cartItems: proObj
                            }
                        }).then((response) => {
                            resolve()
                        })
                    }

                } else {

                    let cartObj = {
                        user: userId,
                        cartItems: proObj
                    }
                    db.cart(cartObj).save().then(() => {
                        resolve()
                    })

                }
            } catch (err) {
                console.log(err);
            }
        })
    },

    getCartProducts: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.cart.aggregate([

                    {
                        $match: { user: userId }
                    },
                    {
                        $unwind: '$cartItems'
                    },
                    {
                        $project: {
                            item: '$cartItems.products',
                            quantity: '$cartItems.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: "item",
                            foreignField: "_id",
                            as: 'cartItems'
                        }
                    }, {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$cartItems', 0] }
                        }
                    }

                ]).then((cartItems) => {
                    resolve(cartItems)
                })
            } catch (err) {
                console.log(err)
            }
        })
    },

    getCartCount: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                let cartCount = 0
                db.cart.findOne({ user: userId }).then((cart) => {
                    for (i = 0; i < cart?.cartItems?.length; i++) {
                        cartCount += cart.cartItems[i].quantity
                    }
                    resolve(cartCount)
                })
            } catch (err) {
                console.log(err);
            }
        })
    },

    changeProductQuantity: (data) => {
        count = parseInt(data.count)
        return new Promise((resolve, reject) => {
            try {
                db.cart.updateOne({ '_id': data.cart, 'cartItems.products': data.product }, {
                    $inc: { 'cartItems.$.quantity': count }
                }).then(() => {
                    resolve({ status: "success" })
                })
            } catch (err) {
                console.log(err);
            }
        })
    },

    deleteCartItem: (data) => {
        return new Promise((resolve, reject) => {
            try {
                db.cart.updateOne({ '_id': data.cartId },
                    {
                        $pull: { cartItems: { products: data.product } }
                    }
                ).then(() => {
                    resolve({ removeProduct: true })
                })
            } catch (err) {
                console.log(err);
            }
        })
    },

    checkCartQuantity: async (userId, proId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.cart.findOne({ user: userId })
            if (cart) {
                let cartIndex = cart?.cartItems?.findIndex(cart => cart.products == proId)
                if (cartIndex == -1) {
                    let quantity = 0
                    resolve({ status: true, quantity: quantity })
                } else {
                    let quantity = cart?.cartItems[cartIndex]?.quantity
                    resolve({ status: true, quantity: quantity })
                }
            } else {
                resolve({ status: false })
            }

        })

    },

    getTotalAmount: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.cart.aggregate([

                    {
                        $match: { user: userId }
                    },
                    {
                        $unwind: '$cartItems'
                    },
                    {
                        $project: {
                            item: '$cartItems.products',
                            quantity: '$cartItems.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: "item",
                            foreignField: "_id",
                            as: 'cartItems'
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$cartItems', 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                        }
                    }
                ]).then((total) => {
                    resolve(total[0]?.total)
                })
            } catch (err) {
                console.log(err);
            }
        })
    },


    getAllStates: () => {
        return new Promise((resolve, reject) => {
            try {
                db.state.find({}).then((states) => {
                    resolve(states)
                })
            } catch (err) {
                console.log(err);
            }
        })
    },

    //placeOrder

    placeOrder: (order, total) => {

        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.cart.aggregate([
                    {
                        $match: { user: order.userId }
                    },
                    {
                        $unwind: '$cartItems'
                    },
                    {
                        $project: {
                            item: '$cartItems.products',
                            quantity: '$cartItems.quantity'
                        }
                    },
                    {

                        $lookup: {
                            from: 'products',
                            localField: 'item',
                            foreignField: '_id',
                            as: 'cartItemsRs'
                        }
                    },
                    {
                        $unwind: '$cartItemsRs'
                    },
                    {
                        $set: { 'cartItemsRs': { status: true } }
                    },
                    {
                        $project: {
                            _id: '$cartItemsRs._id',  //productId
                            quantity: 1,             //minQuantity
                            productsName: '$cartItemsRs.name',
                            productsPrice: '$cartItemsRs.price',
                            status: '$cartItemsRs.status',
                            orderStatus: 'Processing',
                            img: "$cartItemsRs.img"
                        }
                    }
                ])


                //totalQuatity

                let totalQuantity = 0
                for (let i = 0; i < products.length; i++) {
                    totalQuantity += products[i].quantity
                }

                //address

                let Address = {
                    fname: order.firstname,
                    lname: order.lastName,
                    street: order.street,
                    apartment: order.apartment,
                    city: order.city,
                    state: order.state,
                    pincode: order.pincode,
                    mobile: order.mobile,
                    email: order.email
                }

                let addresObj = {
                    userId: order.userId,
                    address: Address
                }

                let addrExist = await db.address.findOne({ userId: order.userId })

                if (addrExist) {

                    db.address.find({ 'address.street': order.street, 'address.pincode': order.pincode }).then((res) => {
                        if (res.length == 0) {
                            db.address.updateOne(
                                { userId: order.userId },
                                {
                                    $push: {
                                        address: Address
                                    }
                                }).then((data) => {
                                    resolve()
                                })
                        }
                    })

                } else {

                    db.address(addresObj).save().then(() => {
                        resolve()
                    })

                }

                //inventory

                for (let i = 0; i < products.length; i++) {
                    await db.products.updateOne(
                        {
                            _id: products[i]._id
                        },
                        {
                            $inc: { quantity: -products[i].quantity }
                        }
                    )
                }

                //orders

                let orderAddress = {

                    apartment: order.apartment,
                    street: order.street,
                    city: order.city,
                    state: order.state,
                    pincode: order.pincode,
                    mobile: order.mobile,
                    email: order.email,

                }

                let orderData = {
                    userId: order.userId,
                    fname: order.firstname,
                    lname: order.lastname,
                    mobile: order.mobile,
                    paymentMethod: order.paymentMethod,
                    paymentStatus: order.paymentStatus,
                    productsDetails: products,//projected data
                    totalPrice: total,
                    totalQuantity: totalQuantity,
                    shippingAddress: orderAddress,
                }

                orderObj = {
                    userId: order.userId,
                    orders: orderData
                }

                let orderExist = await db.order.findOne({ userId: order.userId })
                if (orderExist) {
                    db.order.updateOne(
                        {
                            userId: order.userId
                        },
                        {
                            $push: { orders: orderData }
                        }
                    ).then((order) => {
                        resolve({ order: "success" })
                    })

                } else {

                    let saveOrder = await db.order(orderObj)
                    await saveOrder.save()

                }

                db.cart.deleteMany({ user: order.userId }).then((response) => {
                    resolve({ order: "success" })
                })
            } catch (err) {
                console.log(err);
            }
        })
    },

    //get orderList

    ordersDetails: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.order.aggregate([
                    {
                        $match: { userId: userId }
                    },
                    {
                        $unwind: '$orders'
                    },
                    {
                        $sort: { 'orders.createdAt': -1 }
                    }
                ]).then((orders) => {
                    // console.log('orders=>', orders);
                    resolve(orders)
                })
            } catch (err) {
                console.log(err);
            }
        })

    },

    //cancelOrder

    cancelOrder: (data, userId) => {
        // console.log(data);
        return new Promise(async (resolve, reject) => {
            console.log(data.orderId);
            try {
                let order = await db.order.find({ 'orders._id': data.orderId })
                // console.log('order->', order);
                if (order) {

                    let orderIndex = order[0].orders.findIndex(order => order._id == data.orderId)
                    // console.log('orderindex=>', orderIndex);
                    let productIndex = order[0].orders[orderIndex].productsDetails.findIndex(product => product._id == data.proId)

                    db.order.updateOne({ 'orders._id': data.orderId },
                        {
                            $set: {
                                ['orders.' + orderIndex + '.productsDetails.' + productIndex + '.status']: false
                            }

                        }).then(() => {

                            //inventory

                            let quantity = order[0].orders[orderIndex].productsDetails[productIndex].quantity
                            console.log(quantity);

                            db.products.updateOne(
                                {
                                    _id: data.proId
                                },
                                {
                                    $inc: { quantity: quantity }
                                }
                            ).then((e) => {
                                // console.log(e);
                                resolve({ status: true })
                            })
                        })


                }
            } catch (err) {
                console.log(err);
            }
        })
    },

    //returnProduct

    returnProduct: (data, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await db.order.find({ 'orders._id': data.orderId })
                // console.log(order);
                let flag = 1
                if (order) {
                    let orderIndex = order[0].orders.findIndex(order => order._id == data.orderId)
                    // console.log(orderIndex);
                    let productIndex = order[0].orders[orderIndex].productsDetails.findIndex(product => product._id == data.prodId)
                    // console.log(productIndex);

                    await db.order.updateOne(
                        {
                            userId: userId
                        },
                        {
                            $set: {
                                ['orders.' + orderIndex + '.productsDetails.' + productIndex + '.orderStatus']: 'Returned',
                                ['orders.' + orderIndex + '.productsDetails.' + productIndex + '.status']: false
                            }
                        }
                    );

                    db.data.aggregate([
                        {
                            $match: ({ userId: ObjectId(data.orderId) })
                        },
                        {
                            $unwind: '$orders'
                        },
                        {
                            $unwind: '$orders.productsDetails'
                        },
                        {
                            $match: { $and: [{ 'orders._id': ObjectId(data.orderId), 'orders.productsDetails._id': ObjectId(data.prodId) }] }
                        }
                    ]).then((aggrData) => {
                        let priceToWallet = {
                            price: 0
                        }
                        let totalPrice = aggrData[0].orders.productsDetails.productsPrice * aggrData[0].orders.productsDetails.quantity
                        if (aggrData[0].orders.totalPrice - totalPrice < 0){
                            priceToWallet.price = aggrData[0].orders.totalPrice
                        }else{
                            priceToWallet.price = totalPrice
                        }

                        db.products.updateOne({_id:prodId},{
                            $inc:{quantity:aggrData[0].orders.productsDetails.quantity}
                        }).then((e)=>{
                            console.log(e);
                        })

                        db.user.updateOne({_id:user},{
                            $push:{
                                walet:priceToWallet
                            }
                        }).then((e)=>{
                            console.log(e);
                            resolve({status:true})
                        })
                    })


                } else {
                    resolve({ status: false })
                }
            } catch (err) {
                console.log(err);
            }
        })
    },

    //getAddress

    getaddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let addressData = await db.address.find({ userId: userId })
                resolve(addressData)
            } catch (err) {
                console.log(err);
            }
        })
    },

    //getSingleAddress

    getSingleAddress: (addrId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let address = await db.address.aggregate([
                    {
                        $match: { userId: userId }
                    },
                    {
                        $unwind: '$address'
                    },
                    {
                        $match: {
                            'address._id': ObjectId(addrId)
                        }
                    }
                ])
                    .then((data) => {
                        resolve(data)
                    })
            } catch (err) {
                console.log(err);
            }
        })
    },

    editAddress: (data, userId) => {
        // console.log(data);
        return new Promise(async (resolve, reject) => {
            try {
                let address = await db.address.find({ userId: userId })
                // console.log(address);
                let addressIndex = address[0].address.findIndex(address => address._id == data._id)
                // console.log(addressIndex);

                let addressData = {
                    fname: data.firstname,
                    lname: data.lastName,
                    street: data.street,
                    apartment: data.apartment,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    mobile: data.mobile,
                    email: data.email,
                }

                db.address.updateOne({ userId: userId }, {
                    $set: {
                        ['address.' + addressIndex]: addressData
                    }
                }).then((data) => {
                    console.log(data);
                    resolve({ status: true })
                })
            } catch (err) {
                console.log(err);
            }
        })
    },

    generateRazorPay: async (userId, total) => {
        const ordersDetails = await db.order.find({ userId: userId })
        let orders = ordersDetails[0].orders.slice().reverse()
        let orderId = orders[0]._id

        console.log('orderId=>', orderId);
        total = total * 100

        return new Promise((resolve, reject) => {
            try {
                var options = {
                    amount: total,
                    currency: "INR",
                    receipt: "" + orderId,
                };
                instance.orders.create(options, function (err, order) {
                    resolve(order)
                });
            } catch (err) {
                console.Consolelog(err)
            }
        })
    },

    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto')
                let hmac = crypto.createHmac('sha256', razorPayKey.secretKey)
                hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')
                if (hmac == details['payment[razorpay_signature]']) {
                    resolve()
                } else {
                    reject("not match")
                }
            } catch (err) {
                console.log(err)
            }
        })
    },

    changePaymentStatus: (userId, orderId) => {
        console.log('orderId=>', orderId);
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.order.find({ userId: userId })
                let orderIndex = orders[0].orders.findIndex(order => order._id == orderId)
                db.order.updateOne(
                    {
                        'orders._id': ObjectId(orderId)
                    },
                    {
                        $set: {
                            ['orders.' + orderIndex + '.paymentStatus']: 'PAID'
                        }
                    }
                ).then((data) => {
                    resolve()
                })
            } catch (err) {
                console.log(err)
            }

        })
    },

    addNewAddress: (userId, data) => {
        return new Promise(async (resolve, reject) => {
            try {
                addressData = {
                    fname: data.firstname,
                    lname: data.lastName,
                    street: data.street,
                    apartment: data.apartment,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    mobile: data.mobile,
                    email: data.email,
                }

                let addressExist = await db.address.findOne({ userId: userId })
                if (addressExist) {
                    let sameAddr = db.address.findOne({ 'addressData.fname': data.fname, 'addressData.street': data.street })
                    if (sameAddr.length == 0) {
                        db.address.updateOne(
                            {
                                userId: userId
                            },
                            {
                                $push: { address: addressData }
                            }
                        ).then(() => {
                            resolve({ status: true })
                        })
                    } else {
                        resolve({ status: false })
                    }
                } else {
                    db.address(addressData).save()
                        .then(() => {
                            resolve({ status: true })
                        })
                }
            } catch (err) {
                console.log(err)
            }
        })
    },

    deleteAddress: (userId, addressId) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.address.updateOne(
                    {
                        userId: userId,

                    },
                    {
                        $pull: { address: { _id: addressId } }
                    }
                ).then((e) => {
                    // console.log(e);
                    resolve({ status: true })
                })
            } catch (err) {
                console.log(err)
            }
        })
    },

    orderInvoice: (userId, orderId) => {

        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.order.findOne({ userId: userId })
                // console.log(orders);
                if (orders) {

                    let orderIndex = orders.orders.findIndex(order => order._id == orderId)
                    let lastOrder = orders.orders[orderIndex]

                    resolve({ status: true, data: lastOrder })

                } else {
                    resolve({ status: false })
                }

            } catch (error) {
                console.log(error);
            }
        })

    }
}
