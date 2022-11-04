const mongoose = require('mongoose');
const db = mongoose.createConnection('mongodb://localhost:27017/ecommerce')

db.on('error', (err) => {
    console.log(err)
})

db.once('open', () => {
    console.log('database connected');
})

//for products

const productschema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    quantity: Number,
    description: String
})

// for users 

const usersSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobile: String,
    blocked: {
        type: Boolean,
        default: false
    }
})

// categories 

const categoriesSchema = new mongoose.Schema({
    name: String
})

module.exports = {
    products: db.model('product', productschema),
    users: db.model('users', usersSchema),
    categories: db.model('categories', categoriesSchema)
}