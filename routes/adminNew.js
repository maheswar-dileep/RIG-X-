var express = require('express');
const controllers = require('../controllers/adminController')
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/productHelpers');
const fileUpload = require('express-fileupload');

const auth = require('../controllers/auth');
const router = express.Router();
const layout = 'admin-2-layout'

/* GET users listing. */

router.get('/', controllers.landingPageNew);

/*chartGraph*/

router.get('/chartGraph', controllers.revenueGraphMonth)

/*------------------------add-product------------------------------*/

router.get('/products', auth.verifyAdmin, controllers.newProducts)

/*------------------------add-product------------------------------*/

router.get('/add-products', auth.verifyAdmin, controllers.addProducts) //TODO

/*------------------------delete-product------------------------------*/

router.delete('/delete-products/:id', auth.verifyAdmin, controllers.deleteProducts)//TODO


/*------------------------edit-product------------------------------*/

router.get('/edit-products/:id', auth.verifyAdmin, controllers.newEditProducts)//TODO

router.post('/edit-products/:id', auth.verifyAdmin, controllers.newEditProductsPost)//TODO

/*---------------------users----------------------*/

router.get('/users', auth.verifyAdmin, controllers.newUsers)//TODO

/*---------------block/unblock-users-------------*/

router.put('/user-block/:id', auth.verifyAdmin, controllers.userBlock)//TODO

router.put('/user-unblock/:id', auth.verifyAdmin, controllers.userUnblock)//TODO

/*--------------category-----------------*/

router.get('/category', auth.verifyAdmin, controllers.newCategory)

/*--------------add-category-------------*/

router.get('/add-category', auth.verifyAdmin, controllers.newAddCategory)

router.post('/add-category', auth.verifyAdmin, controllers.newAddCategoryPost)

/*-------------Delete-Category------------------*/

router.delete('/category-delete/:id', auth.verifyAdmin, controllers.deleteCategory)

/*-------------Edit-Category----------------*/

router.get('/category-edit/:id', auth.verifyAdmin, controllers.editCategory)

router.post('/edit-category/:id', auth.verifyAdmin, controllers.editCategoryPost)

/*---------------orders----------------*/

router.get('/orders', auth.verifyAdmin, controllers.newOrdersPage)

/*---------------orderViewMore----------------*/

router.get('/order-view-more/:id', auth.verifyAdmin, controllers.newOrderViewMore)
/*---------------cancelOrder----------------*/

router.put('/admin-cancel-order', auth.verifyAdmin, controllers.cancelOrder)//TODO

/*----------------change-order-status-------------*/

router.post('/change-order-status', auth.verifyAdmin, controllers.changeOrderStatus)

/*-----------------------Sales-Report-------------------*/

router.get('/sales-report', auth.verifyAdmin, controllers.generateSalesReport)

/*-----------------------------generate-pdf-------------------*/

router.get('/generate-PDF-monthly', auth.verifyAdmin, controllers.generateReportPDF)//TODO

/*---------------Coupons----------------*/

router.get('/coupons', auth.verifyAdmin, controllers.newCoupons)

/*---------------Add-Coupons----------------*/

router.get('/add-coupons', auth.verifyAdmin, controllers.addCoupons)

router.post('/add-coupon', auth.verifyAdmin, controllers.addNewCoupen)

router.get('/generate_coupon', auth.verifyAdmin, controllers.generateCoupon)

/*---------------banners----------------*/

router.get('/banners', auth.verifyAdmin, controllers.banner)

router.get('/banner-management', auth.verifyAdmin, controllers.bannerPage)

router.get('/add-banner', auth.verifyAdmin, controllers.addBanner)

router.post('/add-banner', auth.verifyAdmin, controllers.addbannerPost)

router.get('/edit-banner/:id', auth.verifyAdmin, controllers.editBannerPage)

router.post('/edit-banner/:id', auth.verifyAdmin, controllers.editBannerPost)

router.delete('/delete-banner/:id', auth.verifyAdmin, controllers.deleteBanner)

/*---------------category-Banner-Management----------------*/

router.get('/category-banner-list', auth.verifyAdmin, controllers.categoryBannerPage)

router.get('/add-category-banner', auth.verifyAdmin, controllers.addCateBanner)

router.post('/add-category-banner', auth.verifyAdmin, controllers.addCategoryBannerPost)

router.get('/edit-category-banner/:id', auth.verifyAdmin, controllers.editCateBanner)

router.post('/edit-category-banner/:id', auth.verifyAdmin, controllers.editcategoryBannerPost)

router.delete('/delete-category-banner/:id', auth.verifyAdmin, controllers.deleteCategoryBanner)

/*---------------logout----------------*/

router.get('/logout', controllers.adminLogout)


module.exports = router;
