const layout = 'admin-layout'
const adminHelpers = require('../helpers/adminHelpers')
const productHelpers = require('../helpers/productHelpers')
const chartHelpers = require('../helpers/chartHelpers')
const couponHelpers = require('../helpers/couponHelpers')
const bannerHelpers = require('../helpers/bannerHelpers')
const sales = require('../helpers/reportHelpers')
const fileUpload = require('express-fileupload');
const path = require('path')
const fs = require('fs')
const pdf = require('pdf-creator-node')
const { response, router } = require('../app')
const { paymentMethodGraph } = require('../helpers/chartHelpers')
const userHelpers = require('../helpers/userHelpers')
const layoutNew = 'admin-2-layout'

module.exports = {

    //landingPage

    landingPage: async (req, res, next) => {
        try {
            res.render('admin/admin_page', { layout })
        } catch (err) {
            console.log(err)
        }
    },

    revenueGraphMonth: async (req, res) => {
        try {
            let yearly = await sales.yearlySales()
            let monthly = await sales.monthlySales()
            let daily = await sales.dailySales()
            let totalOrders = await chartHelpers.totalOrdersGraph()
            let monthlyPaid = await chartHelpers.revenueGraphMonthPaid()
            let RevenueByDay = await sales.getRevenueByDay()
            chartHelpers.revenueGraphMonth().then((priceStat) => {
                res.send({
                    monthlyPaid, priceStat, totalOrders, yearly, monthly, daily, RevenueByDay

                })
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
            let data = {
                name: req.body.name,
                category: req.body.category,
                marketPrice: req.body.marketPrice,
                offerPrice: req.body.offerPrice,
                percent: req.body.percent,
                quantity: req.body.quantity,
                description: req.body.description
            }
            productHelpers.addProducts(data).then((insertedId) => {
                const imgName = insertedId;
                req.files?.image?.forEach((element, index) => {
                    element.mv('./public/product-images/' + imgName + index + '.jpg', (err, done) => {
                        if (err) {
                            console.log(err)
                        }
                    })
                });
                res.redirect('/admin/products')
            })
        } catch (err) {
            console.log(err);
        }

    },


    //deleteProducts

    deleteProducts: (req, res) => {
        try {
            productHelpers.deleteProduct(req.params.id).then((response) => {
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
            data = {
                name: req.body.name,
                category: req.body.category,
                marketPrice: req.body.marketPrice,
                offerPrice: req.body.offerPrice,
                percent: req.body.percent,
                quantity: req.body.quantity,
                description: req.body.description
            }
            productHelpers.editProduct(prodId, data).then(() => {
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
        productHelpers.addCategories(req.body).then((response) => {
            res.send(response)
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
        adminHelpers.cancelOrder(req.sesion.user, req.body).then((data) => {
            res.json(data)
        })
    },

    //changeOrderStatus

    changeOrderStatus: (req, res) => {
        adminHelpers.changeOrderStatus(req.session.user, req.body).then((response) => {
            res.json(response)
        })
    },

    //orderViewMore

    orderViewMore: (req, res) => {
        adminHelpers.orderViewMore(req.params.id).then((orders) => {
            res.render('admin/orderViewMore', { layout, orders })
        })
    },

    // generateSalesReport

    generateSalesReport: async (req, res) => {
        let yearly = await sales.yearlySales()
        let monthly = await sales.monthlySales()
        let daily = await sales.dailySales()
        let monthWise = await sales.monthWiseSales()
        res.render('admin/Sales-Report', { layout, monthly, yearly, daily, monthWise })
    },

    //generateReportPDF

    generateReportPDF: (req, res) => {
        sales.monthlySales().then((response) => {
            res.send(response)
        })
    },

    //coupons

    coupons: async (req, res) => {
        let coupon = await couponHelpers.getCoupons()
        res.render('admin/coupons', { layout, coupon })
    },

    //add-coupons

    addCoupons: (req, res) => {
        res.render('admin/add-coupons', { layout })
    },

    //add-coupon-post

    addNewCoupen: (req, res) => {
        data = {
            couponName: req.body.couponName,
            expiry: req.body.expiry,
            minPurchase: req.body.minPurchase,
            description: req.body.description,
            discountPercentage: req.body.discountPercentage,
            maxDiscountValue: req.body.maxDiscountValue
        }
        console.log(data);
        couponHelpers.addNewCoupen(data).then((response) => {
            res.send(response)
        })
    },

    // generateCoupon

    generateCoupon: (req, res) => {
        couponHelpers.generateCoupon().then((response) => {
            res.send(response)
        })

    },

    //bannersHome

    banner: (req, res) => {
        res.render('admin/banner-management-home', { layout })
    },

    //bannerPage

    bannerPage: (req, res) => {
        bannerHelpers.banner().then((banner) => {
            res.render('admin/bannerLists', { layout, banner })
        })
    },

    //addBanner

    addBanner: (req, res) => {
        res.render('admin/addBanner', { layout })
    },

    addbannerPost: (req, res) => {
        bannerHelpers.addBanner(req.body).then((insertedId) => {
            let imgName = insertedId
            req.files?.image?.mv('./public/banner-images/' + imgName + '.jpg', () => {
                console.log('done');
            })
            res.redirect('/admin/banners')
        })
    },

    //editBanner

    editBannerPage: (req, res) => {
        bannerHelpers.getBanner(req.params.id).then((data) => {
            res.render('admin/editBanner', { layout, data })
        })

    },

    //editBanner

    editBannerPost: (req, res) => {
        bannerHelpers.editBanner(req.params.id, req.body).then(() => {
            let imgName = req.params.id
            req.files?.image?.mv('./public/banner-images/' + imgName + '.jpg', () => {
                console.log('done');
            })
            res.redirect('/admin/ads-management')
        })
    },

    //deleteBanner

    deleteBanner: (req, res) => {
        bannerHelpers.deleteBanner(req.params.id).then((response) => {
            res.send(response)
        })
    },

    //categoryBannerManagement

    categoryBannerPage: async (req, res) => {
        let data = await bannerHelpers.categoryFind()
        res.render('admin/category-banner-list', { layout, data })
    },


    addCateBanner: (req, res) => {
        productHelpers.getAllCategories().then((category) => {
            res.render('admin/add-category-banner', { layout, category })
        })
    },

    // editCategoryPage

    editCateBanner: async (req, res) => {
        let data = await bannerHelpers.categoryFind(req.params.id)
        productHelpers.getAllCategories().then((category) => {
            res.render('admin/edit-category-banner', { layout, data, category })
        })
    },

    //categoryBanner

    addCategoryBannerPost: (req, res) => {
        bannerHelpers.addCategoryBanner(req.body).then((insertedId) => {
            let imgName = insertedId
            req.files?.image?.mv('./public/banner-images/' + imgName + '.jpg')
            res.redirect('/admin/category-banner-list')
        })
    },

    editcategoryBannerPost: (req, res) => {
        id = req.params.id
        bannerHelpers.editCategoryBanner(id, req.body).then(() => {
            let imgName = id
            req.files?.image?.mv('./public/banner-images/' + imgName + '.jpg')
            res.redirect('/admin/category-banner-list')
        })
    },

    deleteCategoryBanner: (req, res) => {
        bannerHelpers.deleteCategoryBanner(req.params.id).then((response
        ) => {
            res.send(response)
        })
    },

    //adminLogout

    adminLogout: (req, res) => {
        req.session.admin = null
        res.redirect('/admin/login')
    },


    /*==================================adminNew=================================*/

    //landingPage

    landingPageNew: async (req, res, next) => {
        try {
            let totalOrders = await chartHelpers.totalOrdersGraph()
            res.render('admin-2/admin_page_new', { layout: "admin-2-layout", totalOrders })
        } catch (err) {
            console.log(err)
        }
    },

    chartGraphNew: async (req, res) => {
        try {
            let users = await sales.findUsers()
            let yearly = await sales.yearlySales()
            let monthly = await sales.monthlySales()
            let RevenueByDay = await sales.getRevenueByDay()
            let daily = await sales.dailySales()
            let totalOrders = await chartHelpers.totalOrdersGraph()
            console.log('hello', RevenueByDay);
            chartHelpers.priceGraph().then((priceStat) => {
                res.send({ priceStat, yearly, monthly, daily, totalOrders, RevenueByDay })
            })
        } catch (err) {
            console.log(err)
        }
    },








    /*=========================================admin-new=============================================*/
    /*===========================admin-new=============================================*/



    newProducts: (req, res) => {
        try {
            productHelpers.getAllProducts().then((products) => {
                res.render('admin-2/products/products', {
                    products: products, layout: layoutNew
                })
            })
        } catch (err) {
            console.log(err);
        }
    },

    //editProducts

    newEditProducts: async (req, res) => {
        try {

            let products = await productHelpers.getProductDetails(req.params.id)
            productHelpers.getAllCategories().then((category) => {
                res.render('admin-2/products/edit-products', { category, products, layout: layoutNew })
            })
        }
        catch (err) {
            console.log(err);
        }
    },


    newEditProductsPost: (req, res) => {
        try {
            prodId = req.params.id
            console.log(req.body,prodId);
            data = {
                name: req.body.name,
                category: req.body.category,
                marketPrice: req.body.marketPrice,
                offerPrice: req.body.offerPrice,
                percent: req.body.percent,
                quantity: req.body.quantity,
                description: req.body.description
            }
            productHelpers.editProduct(prodId, data).then(() => {
                const imgName = prodId;
                req.files?.image0?.mv('./public/product-images/' + imgName + '0.jpg')
                req.files?.image1?.mv('./public/product-images/' + imgName + '1.jpg')
                req.files?.image2?.mv('./public/product-images/' + imgName + '2.jpg')
                req.files?.image3?.mv('./public/product-images/' + imgName + '3.jpg')
                res.redirect('/admin-panel/products')
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    //users 

    newUsers: (req, res) => {
        try {
            adminHelpers.getAllUsers().then((users) => {
                // console.log(users)
                res.render('admin-2/users/users', {
                    users,
                    layout: layoutNew
                })
            })
        }
        catch (err) {
            console.log(err);
        }
    },

    //category

    newCategory: (req, res) => {
        productHelpers.getAllCategories().then((category) => {
            res.render('admin-2/category/category', {
                layout: layoutNew,
                category
            })
        })
    },

    //addCategory

    newAddCategory: (req, res) => {
        res.render('admin-2/add-category', {
            layout: layoutNew
        })
    },

    newAddCategoryPost: (req, res) => {
        productHelpers.addCategories(req.body).then((response) => {
            res.send(response)
        })
    },
    //deleteCategory

    newDeleteCategory: (req, res) => {
        id = req.params.id
        productHelpers.deleteCategory(id).then((response) => {
            res.json(response)
        })
    },

    //editCategory

    newEditCategory: async (req, res) => {
        let category = await productHelpers.getCategoryDetails(req.params.id).then((category) => {
            // console.log(category)
            res.render('admin-2/category/edit-category', {
                layout: layoutNew,
                category: category
            })
        })
    },

    newEditCategoryPost: (req, res) => {
        productHelpers.editCategory(req.params.id, req.body).then((data) => {
            if (data.status) {
                res.send({ value: 'success' })
            } else {
                res.send({ value: 'failed' })
            }
        })
    },

    //ordersPage

    newOrdersPage: (req, res) => {
        adminHelpers.ordersPage().then((orders) => {
            res.render('admin-2/orders/orders', { layout: layoutNew, orders })
        })
    },

    //orderViewMore

    newOrderViewMore: (req, res) => {
        adminHelpers.orderViewMore(req.params.id).then((orders) => {
            res.render('admin-2/orders/order-view-more', { layout: layoutNew, orders })
        })
    },

    newCoupons: async (req, res) => {
        let coupon = await couponHelpers.getCoupons()
        res.render('admin-2/coupon/coupon', { layout:layoutNew, coupon })
    },

    //add-coupons

    addCoupons: (req, res) => {
        res.render('admin/add-coupons', { layout })
    },

    //add-coupon-post

    addNewCoupen: (req, res) => {
        data = {
            couponName: req.body.couponName,
            expiry: req.body.expiry,
            minPurchase: req.body.minPurchase,
            description: req.body.description,
            discountPercentage: req.body.discountPercentage,
            maxDiscountValue: req.body.maxDiscountValue
        }
        console.log(data);
        couponHelpers.addNewCoupen(data).then((response) => {
            res.send(response)
        })
    },

    // generateCoupon

    generateCoupon: (req, res) => {
        couponHelpers.generateCoupon().then((response) => {
            res.send(response)
        })

    },

}