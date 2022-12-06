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


module.exports = router;
