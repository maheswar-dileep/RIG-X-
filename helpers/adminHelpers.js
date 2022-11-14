const { response } = require('../app')
const { users } = require('../model/connection')
const db = require('../model/connection')
const bcrypt = require('bcrypt')
const adminData = require('../config/admin_pass')

const data = adminData.userid;

module.exports = {

    //adminLogin

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log(userData);
            if (data.email == userData.email) {
                bcrypt.compare(userData.password, data.password).then((loginTrue) => {
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

        })
    },

    //addUser

    addUser: (userData) => {

        return new Promise(async (resolve, reject) => {
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

        })
    },

    //getAllUsers

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.users.find({})
            resolve(users)
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
                resolve(update)
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
                resolve(update)
            } catch (error) {
                console.log(error)
            }
        })
    },

    //ordersPage

    ordersPage: () => {
        return new Promise((resolve, reject) => {
            db.order.find({}).then((orders) => {
                resolve(orders)
            })
        })
    },

    //cancelOrder

    cancelOrder: (data) => {
        console.log(data);
        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.order.find({ _id: data.orderId })
            // console.log(orderDetails)
            if (orderDetails) {
                let indexOfProduct = orderDetails[0].productsDetails.findIndex(product => product._id == data.prodId)
                console.log(indexOfProduct);

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
                    resolve({ status: true })
                })
            }
        })
    }

}