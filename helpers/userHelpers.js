const db = require("../config/connection")
const bcrypt = require('bcrypt')
const { response } = require("../app")

module.exports = {


    doSignup: (userData) => {

        return new Promise(async (resolve, reject) => {
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

        })
    },

    doLogin: (userData) => {


        return new Promise(async (resolve, reject) => {
            {

                let response = {}
                let user = await db.users.findOne({ email: userData.email })
                if (user) {
                    bcrypt.compare(userData.password,user.password).then((status) => {
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
        return new Promise(async(resolve,reject)=>{

            db.users.find({mobile:mobileNumber}).then(async(user)=>{
                resolve(user)
            })
        })
    },


}