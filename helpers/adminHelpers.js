const { response } = require('../app')
const { users } = require('../model/connection')
const db = require('../model/connection')
const bcrypt = require('bcrypt')
const adminData = require('../config/admin_pass')
const { ObjectId } = require('mongodb')

const data = adminData.userid;

module.exports = {

    //adminLogin

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                // console.log(userData);
                if (data.email == userData.email) {
                    bcrypt.compare(userData?.password, data?.password).then((loginTrue) => {
                        let response = {}
                        if (loginTrue) {
                            console.log('login successful');
                            response.admin = data;
                            response.status = true;
                            resolve(response);
                        } else {
                            console.log("login failed");
                            resolve({ status: false });
                        }
                    })
                } else {
                    console.log('Login failed email');
                    resolve({ status: false });
                }
            } catch (err) {
                console.log(err)
            }
        })
    },

    //addUser

    addUser: (userData) => {

        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                db.users.find({ email: userData.email }).then(async (user) => {


                    if (user.length == 0) {

                        userData.password = await bcrypt.hash(userData.password, 10)
                        let data = await db.users(userData)
                        data.save()
                        response.data = data
                        response.status = true
                        resolve(response)

                    } else {
                        resolve({ status: false })
                    }
                })
            } catch (err) {
                console.log(err)
            }
        })
    },

    //getAllUsers

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let users = await db.users.find({})
                resolve(users)
            } catch (err) {
                console.log(err)
            }
        })
    },

    //blockUsers

    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let update = await db.users.updateOne({ _id: userId }, {
                    $set: {
                        blocked: true
                    }
                });
                resolve({ status: true })
            } catch (error) {
                console.log(error);
            };

        })
    },

    //unblockUsers

    unblockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let update = await db.users.updateOne({ _id: userId }, {
                    $set: {
                        blocked: false
                    }
                });
                resolve({ status: true })
            } catch (error) {
                console.log(error)
            }
        })
    },

    //ordersPage

    ordersPage: () => {
        return new Promise((resolve, reject) => {
            try {
                db.order.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        $sort: { 'orders.createdAt': -1 }
                    }
                ]).then((orders) => {
                    // console.log(orders);
                    resolve(orders)
                })
            } catch (err) {
                console.log(err)
            }
        })
    },

    //cancelOrder



    cancelOrder: (data) => {
        console.log(data);
        return new Promise(async (resolve, reject) => {
            // console.log(data.orderId);
            try {
                let order = await db.order.find({ 'orders._id': ObjectId(data.orderId) })
                console.log('order->', order);
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

    //changeOrderStatus

    changeOrderStatus: (userId, data) => {
        console.log(data);
        let status = data.status
        // console.log("fghjk",status);
        let orderId = data.orderId
        // console.log(orderId);rreturn zero is a 
        return new Promise(async (resolve, reject) => {
            try {
                let order = await db.order.find({ 'orders._id': data.orderId })
                // console.log(order[0].orders[0].productsDetails);
                let flag = 1
                if (order) {
                    let orderIndex =await order[0].orders.findIndex(order => order._id == data.orderId)
                    // console.log(orderIndex);
                    let productIndex =await  order[0].orders[orderIndex].productsDetails.findIndex(product => product._id == data.prodId)
                    // console.log(productIndex);

                     let data1 = await db.order.updateOne(
                        {
                            'orders._id': data.orderId
                        },
                        {
                            $set: {
                                ['orders.' + orderIndex + '.productsDetails.' + productIndex + '.orderStatus'] : data.status
                            }
                        }
                    )
                   
                    if (status == 'Delivered') {
                        // console.log('delvered');
                        db.order.updateOne(
                            {
                                userId: userId
                            },
                            {
                                $set: {
                                    ['orders.' + orderIndex + '.productsDetails.' + productIndex + '.deliveredAt']: new Date
                                }
                            }
                        ).then(() =>{

                             resolve({ status: true })
                        }
                         )
                    } else {

                        resolve({ status: true })
                    }
                } else {
                    resolve({ status: false })
                }
            } catch (err) {
                console.log(err);
            }
        })
    },

    orderViewMore: (id) => {
        // console.log(id);
        return new Promise((resolve, reject) => {
            try {
                db.order.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        $match: { "orders._id": ObjectId(id) }
                    },
                    {
                        $sort: { 'orders.createdAt': -1 }
                    }
                ]).then((orders) => {
                    // console.log('orders=>', orders);
                    resolve(orders)
                })
            } catch (err) {
                console.log(err)
            }
        })
    }

}