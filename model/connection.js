const mongoose = require('mongoose');
const { StreamInstance } = require('twilio/lib/rest/api/v2010/account/call/stream');
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
    marketPrice: Number,
    offerPrice: Number,
    percent: Number,
    category: String,
    quantity: Number,
    description: String,
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
    },
    wallet: {
        type: Number,
        default: 0
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

//coupons
const couponSchema = new mongoose.Schema({
    coupon: String,
    discountType: String,
    amount: Number,
    amountValidity: String,
    percentage: Number,
    description: String,
    createdAt: {
        type: Date,
        default: new Date()
    },
    validityTill: Date,
    usageValidity: Number
})

//banners
const bannerSchema = new mongoose.Schema({
    title: String,
    description: String,
})

//categoryBanner

const categoryBanner = new mongoose.Schema({
    category: String,
},
{
    capped:{max:3}
})

module.exports = {
    products: db.model('product', productschema),
    users: db.model('users', usersSchema),
    categories: db.model('categories', categoriesSchema),
    cart: db.model('cart', cartSchema),
    address: db.model('address', addressSchema),
    order: db.model('order', orderSchema),
    state: db.model('state', stateSchema),
    coupon: db.model('coupon', couponSchema),
    banner: db.model('banner', bannerSchema),
    categoryBanner: db.model('categoryBanner', categoryBanner)
}