var express = require('express');
const controllers = require('../controllers/adminController')
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/productHelpers');
const multer = require('multer')

const auth = require('../controllers/auth');
const router = express.Router();
const layout = 'admin-2-layout'

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

router.get('/', controllers.landingPageNew);

/*chartGraph*/

router.get('/chartGraph', controllers.revenueGraphMonth)


module.exports = router;
