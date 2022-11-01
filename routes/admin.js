var express = require('express');
const { products } = require('../config/connection');
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/productHelpers');

const router = express.Router();
const layout = 'admin-layout'



/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin/admin_page', {
    layout
  })
});

router.get('/add-products', (req, res) => {
  res.render('admin/add_products', {
    layout
  })
})


/*------------------------add-product------------------------------*/


router.post('/add-products', (req, res) => {

  productHelpers.addProducts(req.body).then((insertedId) => {
    let image = req.files.image
    const imgName = insertedId;
    console.log(imgName);

    image.mv('./public/product-images/' + imgName + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/products')
      } else {
        console.log(err)
      }
    })

  })

})

/*------------------------products------------------------------*/


router.get('/products', (req, res) => {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/products', {
      products: products,
      layout: layout
    })
    // console.log(products)
  })
})


/*------------------------delete-product------------------------------*/


router.get('/delete-products/:id', (req, res) => {
  let prodId = req.params.id
  console.log(prodId);
  productHelpers.deleteProduct(prodId).then(() => {
    res.redirect('/admin/products')
  })
})


/*------------------------edit-product------------------------------*/


router.get('/edit-products/:id', async (req, res) => {
  let products = await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-products', { products, layout })
})

router.post('/edit-products/:id', (req, res) => {
  productHelpers.editProduct(req.params.id, req.body).then(()=>{
    res.redirect('/admin/products')
  })
})

router.get('/add-users',(req,res)=>{
  res.render('admin/add-user',{
    layout
  })
})

router.post('/add-user',(req,res)=>{
  adminHelpers.addUser(req.body).then((data)=>{
    res.redirect('/admin/users')
  })
})


router.get('/users', (req, res) => {
  adminHelpers.getAllUsers().then((users)={    
    
  })
})
module.exports = router;
