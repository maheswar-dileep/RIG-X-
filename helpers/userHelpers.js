const db = require("../model/connection")
const bcrypt = require('bcrypt')
const { response } = require("../app")
const { userid } = require("../config/admin_pass")
const { address } = require("../model/connection")
const { cancelOrder } = require("../controllers/userController")
const ObjectId = require('mongodb').ObjectId
module.exports = {


    doSignup: (userData) => {

        return new Promise(async (resolve, reject) => {
            let response = {}
            db.users.find({ email: userData.email }).then(async (user) => {

                if (user.length == 0) {

                    userData.password = await bcrypt.
                        hash(userData.password, 10)
                    let data = await db.users(userData)
                    data.save()
                    response.user = data
                    response.status = true
                    resolve(response)

                } else {
                    resolve({ status: false })
                }

            })

        })
    },

    doLogin: (userData) => {


        return new Promise(async (resolve, reject) => {
            {

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
            }
        })
    },
    getUserDetailsNo: (mobileNumber) => {
        return new Promise(async (resolve, reject) => {

            db.users.find({ mobile: mobileNumber }).then(async (user) => {
                resolve(user)
            })
        })
    },

    addToCart: (prodId, userId) => {

        let proObj = {
            products: prodId,
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
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

        })
    },

    getCartProducts: (userId) => {
        return new Promise((resolve, reject) => {
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
        })
    },

    getCartCount: (userId) => {
        return new Promise((resolve, reject) => {
            let cartCount = 0
            db.cart.findOne({ user: userId }).then((cart) => {
                for (i = 0; i < cart?.cartItems?.length; i++) {
                    cartCount += cart.cartItems[i].quantity
                }
                resolve(cartCount)
            })
        })
    },

    changeProductQuantity: (data) => {
        count = parseInt(data.count)
        return new Promise((resolve, reject) => {
            db.cart.updateOne({ '_id': data.cart, 'cartItems.products': data.product }, {
                $inc: { 'cartItems.$.quantity': count }
            }).then(() => {
                resolve({ status: "success" })
            })
        })
    },

    deleteCartItem: (data) => {
        return new Promise((resolve, reject) => {
            db.cart.updateOne({ '_id': data.cartId },
                {
                    $pull: { cartItems: { products: data.product } }
                }
            ).then(() => {
                resolve({ removeProduct: true })
            })
        })
    },

    getTotalAmount: (userId) => {
        return new Promise((resolve, reject) => {
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
        })
    },


    getAllStates: () => {
        return new Promise((resolve, reject) => {
            db.state.find({}).then((states) => {
                resolve(states)
            })
        })
    },

    //placeOrder

    placeOrder: (order, total) => {
        return new Promise(async (resolve, reject) => {

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
                        quantitiy: '$cartItems.quantity'
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
                        _id: '$cartItemsRs._id',
                        quantity: 1,
                        productsName: '$cartItemsRs.name',
                        productsPrice: '$cartItemsRs.price',
                        status: '$cartItemsRs.status'
                    }
                }
            ])

            // console.log(products);

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
                address: [Address]
            }


            let addr = db.address.findOne({userId:order.userId})

            if (addr){
                db.address.find({ 'address.street': order.street, 'address.pincode': order.pincode }).then((res) => {
                    if (res.length == 0) {
                        db.address.updateOne({ userId: order.userId }, {
                            $push: {
                                address: Address
                            }
                        }).then((data)=>{
                            resolve()
                        })
                    }
                })
            }else{
                db.address(Address).save().then(()=>{
                    resolve()
                })
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

            let orderObj = {
                userId: order.userId,
                fname: order.firstname,
                lname: order.lastname,
                mobile: order.mobile,
                paymentMethod: order.paymentMethod,
                productsDetails: products,
                totalPrice: total,
                shippingAddress: [orderAddress]
            }

            db.order(orderObj).save()
            db.cart.deleteMany({ user: order.userId }).then((response) => {
                resolve({ order: "success" })
            })
        })
    },

    //ordersPage

    ordersDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.order.find({ userId: userId }).then((orders) => {
                resolve(orders)
            })
        })
    },

    //cancelOrder

    cancelOrder: (data) => {
        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.order.find({ _id: data.orderId })
            // console.log(orderDetails)
            if (orderDetails) {
                let indexOfProduct = orderDetails[0].productsDetails.findIndex(product => product._id == data.prodId)
                // console.log(indexOfProduct);

                db.order.updateOne(
                    {
                        _id: data.orderId
                    },
                    {
                        $set: {
                            ['productsDetails.' + indexOfProduct + '.status']: false
                        }
                    }


                ).then((data) => {
                    // console.log(data);
                    resolve({ status: true })
                })
            }
        })
    }
    ,

    getaddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let addressData = await db.address.find({ userId: userId })
            resolve(addressData)
        })
    },


    getSingleAddress: (addrId, userId) => {
        return new Promise(async (resolve, reject) => {
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
            .then((data)=>{
                resolve(data)
            })
        })
    }



}