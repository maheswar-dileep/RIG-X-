const db = require("../model/connection")

module.exports = {

    findUsers: () => {

        let users = db.users0.find()
        console.log(users);

    },

    monthlySales: () => {
        let month = new Date()
        let thisMonth = month.getMonth()

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
                        $match: { 'orders.productsDetails.orderStatus': 'Delivered' }
                    },
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    {
                                        $month: '$orders.createdAt'
                                    },
                                    thisMonth + 1
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$orders.totalPrice' },
                            orders: { $sum: '$orders.productsDetails.quantity' },
                            totalOrders: { $sum: '$orders.totalQuantity' },
                            count: { $sum: 1 }
                        }
                    }
                ]).then((data) => {
                    // console.log(data);
                    resolve({ status: true, data: data })
                })
            } catch (err) {
                console.log(err);
            }
        })
    },



    dailySales: () => {
        let date = new Date()
        let thisDay = new Date().getDate()

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
                        $match: { 'orders.productsDetails.orderStatus': 'Delivered' }
                    },
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    {
                                        $dayOfMonth: '$orders.createdAt'
                                    },
                                    thisDay
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$orders.totalPrice' },
                            orders: { $sum: '$orders.totalQuantity' },
                            count: { $sum: 1 }
                        }
                    }
                ]).then((data) => {
                    resolve({ status: true, data: data })
                })
            } catch (err) {
                console.log(err);
            }
        })
    },


    yearlySales: () => {
        let date = new Date()
        let year = date.getFullYear()

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
                        $match: { 'orders.productsDetails.orderStatus': 'Delivered' }
                    },
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    {
                                        $year: '$orders.createdAt'
                                    },
                                    year
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$orders.totalPrice' },
                            orders: { $sum: '$orders.totalQuantity' },
                            count: { $sum: 1 }
                        }
                    }
                ]).then((data) => {
                    resolve({ status: true, data: data })
                })
            } catch (err) {
                console.log(err);
            }
        })
    },


    monthWiseSales: () => {

        return new Promise(async (resolve, reject) => {
            try {
                let data = []
                for (let i = 0; i < 12; i++) {
                    await db.order.aggregate([
                        {
                            $unwind: '$orders'
                        },
                        {
                            $unwind: '$orders.productsDetails'
                        },
                        {
                            $match: { 'orders.productsDetails.orderStatus': 'Delivered' }
                        },
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        {
                                            $month: '$orders.createdAt'
                                        },
                                        i + 1
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$orders.totalPrice' },
                                orders: { $sum: '$orders.totalQuantity' },
                                count: { $sum: 1 }
                            }
                        }
                    ]).then((monthlyData) => {
                        data[i + 1] = monthlyData[0]
                    })
                }
                for (i = 0; i < 12; i++) {
                    if (data[i+1] == undefined) {
                        data[i+1] = {
                            total: 0,
                            orders: 0,
                            count: 0,
                        }
                    } else {
                        data[i]
                    }
                }
                resolve({ status: true, data: data })
            } catch (err) {
                console.log(err);
            }
        })
    },


    dailySalesReport: () => {

        return new Promise(async (resolve, reject) => {
            try {
                let date = new Date()
                let thisDay = new Date().getDate()
                let data = []
                for (let i = 0; i < 31; i++) {
                    await db.order.aggregate([
                        {
                            $unwind: '$orders'
                        },
                        {
                            $unwind: '$orders.productsDetails'
                        },
                        {
                            $match: { 'orders.productsDetails.orderStatus': 'Delivered' }
                        },
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        {
                                            $dayOfMonth: '$orders.createdAt'
                                        },
                                        i + 1
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$orders.totalPrice' },
                                orders: { $sum: '$orders.totalQuantity' },
                                count: { $sum: 1 }
                            }
                        }
                    ]).then((dailySales) => {
                        data[i + 1] = dailySales[0]
                    })
                }
                for (i = 0; i < 31; i++) {
                    if (data[i+1] == undefined) {
                        data[i+1] = {
                            total: 0,
                            orders: 0,
                            count: 0,
                        }
                    } else {
                        data[i]
                    }
                }
                resolve({ status: true, data: data })
            } catch (err) {
                console.log(err);
            }
        })
    },

}


