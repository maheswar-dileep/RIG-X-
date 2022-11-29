const mongoose = require('mongoose');
const db = mongoose.createConnection('mongodb://127.0.0.1:27017/ecommerce')

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
    marketPrice: Number,
    category: String,
    quantity: Number,
    description: String,
    img: Array
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

// cart

const cartSchema = new mongoose.Schema({
    user: mongoose.Types.ObjectId,
    cartItems: [{
        products: mongoose.Types.ObjectId,
        quantity: Number
    }]
})

//address
const addressSchema = new mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    address: [{
        fname: String,
        lname: String,
        street: String,
        apartment: String,
        city: String,
        state: String,
        pincode: Number,
        mobile: String,
        email: String
    }]

})

//order

const orderSchema = new mongoose.Schema({

    userId: mongoose.Types.ObjectId,
    orders: [
        {
            fname: String,
            lname: String,
            mobile: Number,
            paymentMethod: String,
            paymentStatus: String,
            totalPrice: Number,
            totalQuantity: Number,
            productsDetails: Array,
            shippingAddress: Object,
            status: {
                type: Boolean,
                default: true
            },
            createdAt: {
                type: Date,
                default: new Date()
            }
        }
    ]
})

//state

const stateSchema = new mongoose.Schema({
    name: String
})


module.exports = {
    products: db.model('product', productschema),
    users: db.model('users', usersSchema),
    categories: db.model('categories', categoriesSchema),
    cart: db.model('cart', cartSchema),
    address: db.model('address', addressSchema),
    order: db.model('order', orderSchema),
    state: db.model('state', stateSchema)
}