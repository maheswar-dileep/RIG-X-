var express = require('express');
const controllers = require('../controllers/adminController')
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/productHelpers');
const multer = require('multer')

const auth = require('../controllers/auth');
const router = express.Router();
const layout = 'admin-layout'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/product-images')
    },
    filename: (req, file, cb, err) => {
        if (err) {
            console.log(err)
        }
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({
    storage: storage
})




/* GET users listing. */

router.get('/', auth.verifyAdmin, controllers.landingPage);

router.get('/login', auth.adminMustLogout, controllers.adminLogin)

router.post('/login', auth.mustLogoutAdminAPI, controllers.adminLoginPost)

/*------------------------add-product------------------------------*/
router.get('/add-products', auth.verifyAdmin, controllers.addProducts)

//chartGraph

router.get('/chartGraph', controllers.chartGraph)

/*------------------------add-products------------------------------*/

router.post('/add-products', auth.verifyAdmin, upload.array('image'), controllers.addProductsPost)

/*------------------------products------------------------------*/

router.get('/products', auth.verifyAdmin, controllers.products)

/*------------------------delete-product------------------------------*/

router.delete('/delete-products/:id', auth.verifyAdmin, controllers.deleteProducts)

/*------------------------edit-product------------------------------*/

//todo:Edit Products post to put

router.get('/edit-products/:id', auth.verifyAdmin, controllers.editProducts)

router.post('/edit-products/:id', auth.verifyAdmin, controllers.editProductsPost)

/*---------------------users----------------------*/

router.get('/users', auth.verifyAdmin, controllers.users)

/* ---------------add-users-----------------*/

router.get('/add-users', auth.verifyAdmin, controllers.addUser)

router.post('/add-user', auth.verifyAdmin, controllers.addUserPost)

/*---------------block/unblock-users-------------*/

router.put('/user-block/:id', auth.verifyAdmin, controllers.userBlock)

router.put('/user-unblock/:id', auth.verifyAdmin, controllers.userUnblock)

/*--------------category-----------------*/

router.get('/category', auth.verifyAdmin, controllers.category)

/*--------------add-category-------------*/

router.get('/add-category', auth.verifyAdmin, controllers.addCategory)

router.post('/add-category', auth.verifyAdmin, controllers.addCategoryPost)

/*-------------Delete-Category------------------*/

router.delete('/category-delete/:id', auth.verifyAdmin, controllers.deleteCategory)

/*-------------Edit-Category----------------*/

router.get('/category-edit/:id', auth.verifyAdmin, controllers.editCategory)

router.post('/edit-category/:id', auth.verifyAdmin, controllers.editCategoryPost)

/*---------------orders----------------*/

router.get('/orders', auth.verifyAdmin, controllers.ordersPage)

/*---------------orderViewMore----------------*/

router.get('/order-view-more/:id', auth.verifyAdmin, controllers.orderViewMore)

/*---------------cancelOrder----------------*/

router.put('/admin-cancel-order', auth.verifyAdmin, controllers.cancelOrder)

/*---------------logout----------------*/

router.get('/logout', controllers.adminLogout)

module.exports = router;
