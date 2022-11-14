const layout = 'admin-layout'
const adminHelpers = require('../helpers/adminHelpers')
const productHelpers = require('../helpers/productHelpers')

module.exports = {

    //landingPage

    landingPage: (req, res, next) => {
        res.render('admin/admin_page', {
            layout
        })
    },

    //adminLogin

    adminLogin: (req, res) => {
        res.render('admin/admin-login', {
            layout
        })
    },

    adminLoginPost: (req, res) => {
        adminHelpers.doLogin(req.body).then((response) => {
            if (response.status) {
                req.session.admin = response.admin._id;
                res.send({ value: "success" })
            } else {
                res.send({ value: "failed" })
            }
        })
    },

    //products

    products: (req, res) => {
        productHelpers.getAllProducts().then((products) => {
            res.render('admin/products', {
                products: products,
                layout: layout
            })
        })
    },

    //addProducts

    addProducts: (req, res) => {
        productHelpers.getAllCategories().then((category) => {
            res.render('admin/add_products', {
                layout, category
            })
        })
    },

    addProductsPost: (req, res) => {
        productHelpers.addProducts(req.body).then((insertedId) => {
            const imgName = insertedId;
            req.files?.image?.forEach((element,index) => {
                element.mv('./public/product-images/' + imgName +index+'.jpg', (err, done) => {
                    if (!err) {
                       console.log('product uploaded');
                    } else {
                        console.log(err)
                    }
                })
            });
            res.redirect('/admin/products')
           
        })

    },

    //deleteProducts

    deleteProducts: (req, res) => {
        let prodId = req.params.id
        productHelpers.deleteProduct(prodId).then(() => {
            res.redirect('/admin/products')
        })
    },

    //editProducts

    editProducts: async (req, res) => {
        let products = await productHelpers.getProductDetails(req.params.id)
        productHelpers.getAllCategories().then((category) => {
            res.render('admin/edit-products', { category, products, layout })
        })
    },

    editProductsPost: (req, res) => {
        prodId = req.params.id
        productHelpers.editProduct(prodId, req.body).then(() => {
           
            const imgName = prodId;
            req.files?.image0?.mv('./public/product-images/' + imgName + '0.jpg')
            req.files?.image1?.mv('./public/product-images/' + imgName + '1.jpg')
            req.files?.image2?.mv('./public/product-images/' + imgName + '2.jpg')
            req.files?.image3?.mv('./public/product-images/' + imgName + '3.jpg')
           res.redirect('/admin/products')
        })
    },

    //users 

    users: (req, res) => {
        adminHelpers.getAllUsers().then((users) => {
            console.log(users)
            res.render('admin/users', {
                users,
                layout
            })
        })
    },

    //addUsers

    addUser: (req, res) => {
        res.render('admin/add-user', {
            layout
        })
    },

    addUserPost: (req, res) => {
        adminHelpers.addUser(req.body).then((data) => {
            if (data.status) {
                res.send({ value: "success" })
            } else {
                res.send({ value: "error" })
            }
        })
    },

    //userBlock/Unblock

    userBlock: (req, res) => {
        userId = req.params.id
        adminHelpers.blockUser(userId).then(() => {
            res.redirect('/admin/users')
        })
    },

    userUnblock: (req, res) => {
        userId = req.params.id
        console.log(userId)
        adminHelpers.unblockUser(userId).then(() => {
            res.redirect('/admin/users')
        })
    },

    //category

    category: (req, res) => {
        productHelpers.getAllCategories().then((category) => {
            res.render('admin/category', {
                layout,
                category
            })
        })
    },

    //addCategory

    addCategory: (req, res) => {
        res.render('admin/add-category', {
            layout
        })
    },

    addCategoryPost: (req, res) => {
        productHelpers.addCategories(req.body).then((data) => {
            if (data.status) {
                res.send({ value: "success" })
            } else {
                res.send({ value: "failed" })
            }
        })
    },

    //deleteCategory

    deleteCategory: (req, res) => {
        id = req.params.id
        productHelpers.deleteCategory(id).then(() => {
            res.redirect('/admin/category')
        })
    },

    //editCategory

    editCategory: async (req, res) => {
        let category = await productHelpers.getCategoryDetails(req.params.id).then((category) => {
            console.log(category)
            res.render('admin/edit-category', {
                layout,
                category: category
            })
        })
    },

    editCategoryPost: (req, res) => {
        productHelpers.editCategory(req.params.id, req.body).then((data) => {
            if (data.status) {
                res.send({ value: 'success' })
            } else {
                res.send({ value: 'failed' })
            }
        })
    },

    //ordersPage

    ordersPage: (req, res) => {
        adminHelpers.ordersPage().then((orders) => {
            res.render('admin/orders', { layout, orders })
        })
    },

    //cancelOrder

    cancelOrder: (req, res) => {
        adminHelpers.cancelOrder(req.body).then((data) => {
            res.json(data)
        })
    },



    //adminLogout

    adminLogout: (req, res) => {
        req.session.admin = null
        res.redirect('/admin/login')
    }


}