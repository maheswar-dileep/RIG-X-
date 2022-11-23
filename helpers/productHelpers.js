const { response } = require('../app')
const db = require('../model/connection')

module.exports = {

    addProducts: (product) => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.products(product)
                data.save()
                resolve(data._id)
            } catch (err) {
                console.log(err)
            }
        })
    },


    getAllProducts: () => {

        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.products.find({})
                resolve(products)
            } catch (err) {
                console.log(err)
            }
        })

    },


    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            try {
                db.products.deleteOne({ _id: prodId }).then(() => {
                    resolve({status:true})
                })
            } catch (err) {
                console.log(err)
            }
        })
    },


    getProductDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            try {
                db.products.findOne({ _id: prodId }).then((product) => {
                    resolve(product)
                })
            } catch (error) {
                console.log(error);
            }

        })
    },


    editProduct: (prodId, data) => {
        try {

            return new Promise(async (resolve, reject) => {
                let products = await db.products.updateOne({ _id: prodId }, {
                    $set: {
                        name: data.name,
                        price: data.price,
                        category: data.category,
                        quantity: data.quantity,
                        description: data.description
                    }
                })
                resolve(products)
            })

        } catch (error) {
            console.log(error)
        }
    },




    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let categories = await db.categories.find({})
                resolve(categories)
            } catch (err) {
                console.log(err)
            }
        })
    },

    getCategoryDetails: (catId) => {
        return new Promise((resolve, reject) => {
            try {
                let category = db.categories.findOne({ _id: catId }).then((category) => {
                    resolve(category)
                })
            } catch (err) {
                console.log(err)
            }
        })
    },




    deleteCategory: (id) => {
        try {
            return new Promise((resolve, reject) => {
                db.categories.deleteOne({ _id: id }).then(() => {
                    resolve({status:true})
                })
            })
        } catch (err) {
            console.log(err);
        }
    },



    addCategories: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.categories.find({ name: data.name }).then(async (category) => {
                    let response = {}
                    if (category.length == 0) {
                        let categories = await db.categories(data)
                        categories.save()
                        response.data = categories
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                    }
                })
            } catch (err) {
                console.log(err);
            }
        })
    },



    editCategory: (catId, data) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.categories.find({ name: data.name }).then(async (category) => {
                    let response = {}
                    if (category.length == 0) {
                        try {
                            let categories = await db.categories.updateOne({ _id: catId }, {
                                $set: {
                                    name: data.name
                                }
                            })
                            response.data = categories
                            response.status = true
                            resolve(response)
                        } catch (err) {
                            console.log(err)
                        }
                    } else {
                        resolve({ status: false })
                    }
                })
            } catch (err) {
                console.log(err);
            }
        })
    },


    ordersPage: () => {
        db.orders.find({})
    }



}