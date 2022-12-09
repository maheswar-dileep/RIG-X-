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
                db.coupon(data).save().then(() => {
                    resolve({ status: true })
                })
            } catch (error) {
                console.log(error);
            }
        })
    },

    getCoupons: () => {
        return new Promise((resolve, reject) => {
            try {
                db.coupon.find({}).then((data) => {
                    resolve(data)
                })
            } catch (error) {

            }
        })
    },

    couponValidator: async (code, total, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let couponExists = await db.coupon.findOne({ couponName: code })

                if (couponExists) {

                    if (new Date(couponExists.expiry) - new Date() > 0) {

                        let userCouponExists = await db.users.findOne({ _id: userId, 'coupons.couponName': code })
                        if (!userCouponExists) {
                            let couponObj = {
                                couponName: code,
                                user: false
                            }
                            db.users.updateOne({ _id: userId }, {
                                $push: {
                                    coupons: couponObj
                                }
                            }).then(() => {
                                resolve({ status: true })
                            })
                        } else {
                            resolve({ status: true })
                        }
                    } else {
                        resolve({ status: false, reason: 'coupon expired' })
                    }
                } else {
                    resolve({ status: false, reason: "coupon does'nt exist" })
                }
            } catch (error) {
                console.log(error);
            }
        })
    },

    couponVerify: (code, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let usedCoupon = await db.users.aggregate([
                    {
                        $match: { _id: userId }
                    },
                    {
                        $unwind: '$coupon'
                    },
                    {
                        $match: { _id: 'userId' }
                    },
                    {
                        $match: {
                            $and: [{ 'coupon.name': code }, { used: false }]
                        }
                    }
                ])
                if (!usedCoupon.length) {
                    resolve({ status: true })
                } else {
                    resolve({ status: false, reason: 'coupon is already Used' })
                }
            } catch (err) {
                console.log(err);
            }
        })
    },

    applyCoupon: (code, total) => {
        return new Promise(async (resolve, reject) => {
            try {
                let coupon = await db.coupon.findOne()
                if (coupon) {                                                         //checking coupon Valid

                    if (new Date(coupon.expiry) - new Date() > 0) {                  //checkingExpiry
                        if (total >= coupon.minPurchase) {                          //checking max offer value
                            let discountAmount = (total * coupon.discountPercentage)/ 100
                            if (discountAmount > coupon.maxDiscountValue) {
                                discountAmount = coupon.maxDiscountValue
                                resolve({ status: true, discountAmount: discountAmount })
                            }else{
                                resolve({ status: true, discountAmount: discountAmount })
                            }
                        } else {
                            console.log('ded1');
                            resolve({ status: false, reason: `Minimum purchase value is ${coupon.minPurchase}` })
                        }

                    } else {
                        console.log('ded2');
                        resolve({ status: false, reason: 'coupon Expired' })
                    }
                }
            } catch (error) {
                console.log(error);
            }
        })
    }
}
