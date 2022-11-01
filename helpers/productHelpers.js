const { response } = require('../app')
const db = require('../config/connection')

module.exports = {

    addProducts: (product) => {
        return new Promise(async(resolve, reject) => {
          let data = await db.products(product)
            data.save()
            resolve(data._id)

        })
    },

    getAllProducts: () => {

        return new Promise(async (resolve, reject) => {
            let products = await db.products.find({})
            resolve(products)
        })

    },

    deleteProduct:(prodId)=>{
    return new Promise( (resolve, reject) => {
        db.products.deleteOne({_id: prodId}).then(()=>{
            resolve()
        })
    })
    },

    getProductDetails:(prodId)=>{
        return new Promise((resolve, reject)=>{
            try {
                db.products.findOne({_id: prodId}).then((product)=>{
                resolve(product)
            })
            } catch (error) {
                console.log(error);
            }
            
        })
    },
    editProduct:(prodId)=>{
        return new Promise((resolve, reject)=>{
            db.products.save({_id: prodId}).then(()=>{
                resolve()
            })
        });
    }

}