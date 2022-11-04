const { response } = require('../app')
const { users } = require('../config/connection')
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const adminData = require('../config/admin_pass')

const data = adminData.userid
module.exports = {

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


    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.users.find({})
            resolve(users)
        })
    },


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
    }

}