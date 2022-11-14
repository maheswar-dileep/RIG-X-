var express = require('express');
const controllers = require('../controllers/adminController')
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/productHelpers');

const auth = require('../controllers/auth')
const router = express.Router();
const layout = 'admin-layout'




/* GET users listing. */

router.get('/', auth.verifyAdmin, controllers.landingPage);

router.get('/login', auth.adminMustLogout, controllers.adminLogin)

router.post('/login', auth.mustLogoutAdminAPI, controllers.adminLoginPost)

/*------------------------add-product------------------------------*/
router.get('/add-products', auth.verifyAdmin, controllers.addProducts)

router.post('/add-products', auth.verifyAdmin, controllers.addProductsPost)

/*------------------------products------------------------------*/

router.get('/products', auth.verifyAdmin, controllers.products)

/*------------------------delete-product------------------------------*/

router.get('/delete-products/:id', auth.verifyAdmin, controllers.deleteProducts)

/*------------------------edit-product------------------------------*/

router.get('/edit-products/:id', auth.verifyAdmin, controllers.editProducts)

router.post('/edit-products/:id', auth.verifyAdmin, controllers.editProductsPost)

/*---------------------users----------------------*/

router.get('/users', auth.verifyAdmin, controllers.users)

/* ---------------add-users-----------------*/

router.get('/add-users', auth.verifyAdmin, controllers.addUser)

router.post('/add-user', auth.verifyAdmin, controllers.addUserPost)

/*---------------block/unblock-users-------------*/

router.get('/user-block/:id', auth.verifyAdmin, controllers.userBlock)

router.get('/user-unblock/:id', auth.verifyAdmin, controllers.userUnblock)

/*--------------category-----------------*/

router.get('/category', auth.verifyAdmin, controllers.category)

/*--------------add-category-------------*/

router.get('/add-category', auth.verifyAdmin, controllers.addCategory)

router.post('/add-category', auth.verifyAdmin, controllers.addCategoryPost)

/*-------------Delete-Category------------------*/

router.get('/category-delete/:id', auth.verifyAdmin, controllers.deleteCategory)

/*-------------Edit-Category----------------*/

router.get('/category-edit/:id', auth.verifyAdmin, controllers.editCategory)

router.post('/edit-category/:id', auth.verifyAdmin, controllers.editCategoryPost)

/*---------------orders----------------*/

router.get('/orders',auth.verifyAdmin,controllers.ordersPage)

/*---------------cancelOrder----------------*/

router.post('/admin-cancel-order',auth.verifyAdmin,controllers.cancelOrder)

/*---------------logout----------------*/

router.get('/logout', controllers.adminLogout)

module.exports = router;
