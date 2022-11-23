const db = require('../model/connection')

let arr = []
module.exports = {

    priceGraph: () => {
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < 12; i++) {
                let price = await db.order.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        '$unwind': '$orders.productsDetails'
                    },
                    // {
                    //     '$match': { 'orders.paymentStatus': 'PAID' }
                    // },
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
            // console.log(arr)
            resolve(arr)
        })
    },

    paymentMethodGraph: () => {

        return new Promise((resolve, reject) => {
            db.orders.aggregate({
                $unwind: orders
            },
                {
                    _id: "orders.paymentMethod", count: { $sum: 1 }
                }
            )
        })

    }
}