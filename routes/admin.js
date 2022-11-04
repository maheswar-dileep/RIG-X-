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
  productHelpers.getAllCategories().then((category) => {
    res.render('admin/add_products', {
      layout, category
    })
  })
})




router.get('/login', (req, res) => {
  res.render('admin/admin-login', {
    layout
  })
})



router.post('/login', (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      res.send({ value: "success" })
    } else {
      res.send({ value: "failed" })
    }
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
  productHelpers.deleteProduct(prodId).then(() => {
    res.redirect('/admin/products')
  })
})


/*------------------------edit-product------------------------------*/


router.get('/edit-products/:id', async (req, res) => {
  let products = await productHelpers.getProductDetails(req.params.id)
  productHelpers.getAllCategories().then((category) => {
    res.render('admin/edit-products', {category, products, layout })
  })
})

router.post('/edit-products/:id', (req, res) => {
  prodId = req.params.id
  productHelpers.editProduct(prodId, req.body).then(() => {
    
    let image = req.files.image
    const imgName = prodId;
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


/* ---------------add-users-----------------*/

router.get('/add-users', (req, res) => {
  res.render('admin/add-user', {
    layout
  })
})

router.post('/add-user', (req, res) => {
  adminHelpers.addUser(req.body).then((data) => {
    if (data.status) {
      res.send({ value: "success" })
    } else {
      res.send({ value: "error" })
    }
  })
})


router.get('/users', (req, res) => {
  adminHelpers.getAllUsers().then((users) => {
    console.log(users)
    res.render('admin/users', {
      users,
      layout
    })
  })
})


/*---------------block/unblock-users-------------*/

router.get('/user-block/:id', (req, res) => {
  userId = req.params.id
  adminHelpers.blockUser(userId).then(() => {
    res.redirect('/admin/users')
  })
})

router.get('/user-unblock/:id', (req, res) => {
  userId = req.params.id
  console.log(userId)
  adminHelpers.unblockUser(userId).then(() => {
    res.redirect('/admin/users')
  })
})


/*--------------category-----------------*/

router.get('/category', (req, res) => {
  productHelpers.getAllCategories().then((category) => {
    res.render('admin/category', {
      layout,
      category
    })
  })
})


/*--------------add-category-------------*/


router.get('/add-category', (req, res) => {
  res.render('admin/add-category', {
    layout
  })
})

router.post('/add-category', (req, res) => {

  productHelpers.addCategories(req.body).then((data) => {
    if (data.status) {
      res.send({ value: "success" })
    } else {
      res.send({ value: "failed" })
    }
  })
})


/*-------------Delete-Category------------------*/

router.get('/category-delete/:id', (req, res) => {
  id = req.params.id
  productHelpers.deleteCategory(id).then(() => {
    res.redirect('/admin/category')
  })
})

/*-------------Edit-Category----------------*/

router.get('/category-edit/:id', async (req, res) => {
  let category = await productHelpers.getCategoryDetails(req.params.id).then((category) => {
    console.log(category)
    res.render('admin/edit-category', {
      layout,
      category: category
    })
  })
})

router.post('/edit-category/:id', (req, res) => {
  productHelpers.editCategory(req.params.id, req.body).then((data) => {
    if (data.status) {
      res.send({ value: 'success' })
    } else {
      res.send({ value: 'failed' })
    }
  })
})



module.exports = router;
