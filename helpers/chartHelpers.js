const { order } = require('../model/connection')
const db = require('../model/connection')

let arr = []
module.exports = {

    revenueGraphMonth: () => {
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < 12; i++) {
                let price = await db.order.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        '$unwind': '$orders.productsDetails'
                    },
                    {
                        '$match': { 'orders.productsDetails.orderStatus': 'Delivered' }
                    },
                    {
                        "$match": {
                            '$expr': {
                                '$eq': [
                                    {
                                        '$month': '$orders.createdAt',

                                    },
                                    i + 1
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$orders.totalPrice' }
                        }
                    }
                ])

                arr[i + 1] = price[0]?.total

            }
            // console.log(arr);
            for (i = 0; i < arr.length; i++) {
                if (arr[i] == undefined) {
                    arr[i] = 0
                } else {
                    arr[i]
                }
            }
            resolve(arr)
        })
    },

    revenueGraphMonthPaid: () => {
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < 12; i++) {
                let price = await db.order.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        '$unwind': '$orders.productsDetails'
                    },
                    {
                        '$match': { 'orders.productsDetails.orderStatus': 'Returned' }
                    },
                    {
                        "$match": {
                            '$expr': {
                                '$eq': [
                                    {
                                        '$month': '$orders.createdAt',

                                    },
                                    i + 1
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$orders.totalPrice' }
                        }
                    }
                ])

                arr[i + 1] = price[0]?.total

            }
            for (i = 0; i < arr.length; i++) {
                if (arr[i] == undefined) {
                    arr[i] = 0
                } else {
                    arr[i]
                }
            }
            resolve(arr)
        })
    },

    revenueGraphYear: () => {
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < 6; i++) {
                let price = await db.order.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        '$unwind': '$orders.productsDetails'
                    },
                    {
                        '$match': { 'orders.productsDetails.orderStatus': 'Delivered' }
                    },
                    {
                        "$match": {
                            '$expr': {
                                '$eq': [
                                    {
                                        '$year': '$orders.createdAt',

                                    },
                                    i + 2016
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$orders.totalPrice' }
                        }
                    }
                ])

                arr[i + 1] = price[0]?.total

            }
            for (i = 0; i < arr.length; i++) {
                if (arr[i] == undefined) {
                    arr[i] = 0
                } else {
                    arr[i]
                }
            }
            resolve(arr)
        })
    },


    totalOrdersGraph: () => {
        return new Promise((resolve, reject) => {
            try {
                db.order.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        $unwind: '$orders.productsDetails'
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 }
                        }
                    }

                ]).then((data) => {
                    resolve(data[0]?.count);
                })
            } catch (err) {
                console.log(err);
            }
        })
    },

    paymentMethodGraph: () => {

        return new Promise((resolve, reject) => {
            db.orders.aggregate([
                {
                    $unwind: orders
                },
                {
                    _id: "orders.paymentMethod",
                    count: { $sum: 1 }
                }
            ])
        }).then((data) => {
            console.log(data);
        })

    }
}