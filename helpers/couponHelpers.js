const voucher_codes = require('voucher-code-generator');
const db = require('../model/connection')
module.exports = {

    generateCoupon: () => {
        return new Promise(async (resolve, reject) => {

            try {
                let couponCode = await voucher_codes.generate({
                    length: 6,
                    count: 1,
                    charset: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                    prefix: "RIG-X-",
                })
                resolve({ status: true, couponCode: couponCode[0] })
            } catch (err) {
                console.log(err);
            }
        })
    },

    addNewCoupen: () => {
        return new Promise((resolve, reject) => {
            try {
                db.coupon(data).save().then(()=>{
                    resolve({status:true})
                })
            } catch (error) {
                console.log(error);
            }
        })
    },

    getCoupons:()=>{
        return new Promise((resolve, reject) => {
            try {
                db.coupon.find({}).then((data)=>{
                    resolve(data)
                })
            } catch (error) {
                
            }
        })
    }
}