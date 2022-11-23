const layout = 'admin-layout'
const adminHelpers = require('../helpers/adminHelpers')
const productHelpers = require('../helpers/productHelpers')
const chartHelpers = require('../helpers/chartHelpers')
const multer = require('multer')
const path = require('path')
const { response } = require('../app')

module.exports = {

    //landingPage

    landingPage: (req, res, next) => {
        try {
            res.render('admin/admin_page', {
                layout
            })
        } catch (err) {
            console.log(err)
        }
    },

    chartGraph: (req, res) => {
        try {
            console.log("hi");
            chartHelpers.priceGraph().then((priceStat) => {
                console.log(priceStat);
                res.send({ priceStat })
            })
        } catch (err) {
            console.log(err)
        }
    },

    //adminLogin

    adminLogin: (req, res) => {
        try {
            res.render('admin/admin-login', {
                layout
            })
        } catch (err) {
            console.log(err)
        }
    },

    adminLoginPost: (req, res) => {
        try {
            adminHelpers.doLogin(req.body).then((response) => {
                if (response.status) {
                    req.session.admin = response.admin._id;
                    res.send({ value: "success" })
                } else {
                    res.send({ value: "failed" })
                }
            })
        } catch (err) {
            console.log(err)
        }
    },

    //products

    products: (req, res) => {
        try {
            productHelpers.getAllProducts().then((products) => {
                res.render('admin/products', {
                    products: products,
                    layout: layout
                })
            })
        } catch (err) {
            console.log(err);
        }
    },

    //addProducts

    addProducts: (req, res) => {
        try {
            productHelpers.getAllCategories().then((category) => {
                res.render('admin/add_products', {
                    layout, category
                })
            })
        } catch (err) {
            console.log(err);
        }
    },

    addProductsPost: (req, res) => {
        try {
            const files = req.files
            const fileName = files.map((file) => {
                return file.filename
            })

            const product = req.body
            product.img = fileName

            productHelpers.addProducts(product).then((insertedId) => {
                res.redirect('/admin/products')
            })
        } catch (err) {
            console.log(err);
        }

    },

    //deleteProducts

    deleteProducts: (req, res) => {
        try {
            let prodId = req.params.id
            productHelpers.deleteProduct(prodId).then((response) => {
                res.json(response)
            })
        } catch (err) {
            console.log(err);
        }
    },

    //editProducts

    editProducts: async (req, res) => {
        try {
            let products = await productHelpers.getProductDetails(req.params.id)
            productHelpers.getAllCategories().then((category) => {
                res.render('admin/edit-products', { category, products, layout })
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    editProductsPost: (req, res) => {
        try {
            prodId = req.params.id
            productHelpers.editProduct(prodId, req.body).then(() => {

                const imgName = prodId;
                req.files?.image0?.mv('./public/product-images/' + imgName + '0.jpg')
                req.files?.image1?.mv('./public/product-images/' + imgName + '1.jpg')
                req.files?.image2?.mv('./public/product-images/' + imgName + '2.jpg')
                req.files?.image3?.mv('./public/product-images/' + imgName + '3.jpg')
                res.redirect('/admin/products')
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    //users 

    users: (req, res) => {
        try {
            adminHelpers.getAllUsers().then((users) => {
                // console.log(users)
                res.render('admin/users', {
                    users,
                    layout
                })
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    //addUsers

    addUser: (req, res) => {
        try {
            res.render('admin/add-user', {
                layout
            })
        }
        catch (err) {
            console.log(err);
        }
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
        adminHelpers.blockUser(userId).then((response) => {
            res.json(response)
        })
    },

    userUnblock: (req, res) => {
        userId = req.params.id
        adminHelpers.unblockUser(userId).then((response) => {
            res.json(response)
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
        productHelpers.deleteCategory(id).then((response) => {
            res.json(response)
        })
    },

    //editCategory

    editCategory: async (req, res) => {
        let category = await productHelpers.getCategoryDetails(req.params.id).then((category) => {
            // console.log(category)
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

    //orderViewMore

    orderViewMore: (req, res) => {
        adminHelpers.orderViewMore(req.params.id).then((orders) => {
            res.render('admin/orderViewMore', { layout, orders })
        })
    },

    //adminLogout

    adminLogout: (req, res) => {
        req.session.admin = null
        res.redirect('/admin/login')
    }


}