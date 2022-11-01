const {response} =  require('../app')
const db = require('../config/connection')

module.exports = {
    
    addUser:(user)=>{
        return new Promise(async(resolve,reject)=>{
            let data = await db.users(user)
            data.save()
        })
    },

    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users= await db.users.find({})
            resolve(users)
        })
    }
}