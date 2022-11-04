const express = require('express');
const { request } = require('../app');
const router = express.Router();
const productHelpers = require('../helpers/productHelpers')
const userHelpers = require('../helpers/userHelpers');
const OTP = require('../config/OTP');
const client = require('twilio')(OTP.accountSID, OTP.authToken)
const auth = require('../controllers/auth')

let nav = false
let footer = true;




/* GET home page. */
router.get('/', auth.verifyUser, function (req, res, next) {
  let user = req.user
  res.render('index', { user, nav, footer: true });
});

router.get('/login', auth.mustLogout, (req, res) => {
  res.render('user/user-login', { nav, footer: false })
})

router.post('/login', auth.mustLogoutAPI, (req, res) => {
  userHelpers.doLogin(req.body).then((data) => {
    if (data.status) {
      req.session.user = data.user._id
      res.send({ value: "success" })
    } else {
      res.send({ value: "failed" })
    }
  })
})
3

router.get('/signup', auth.mustLogout, (req, res) => {
  res.render('user/signup', { nav: true, footer: false })
})

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((data) => {
    if (data.status) {
      req.session.user = data.user._id
      res.send({ value: "success" })
    } else {
      res.send({ value: "account already exists" })
    }
  })
})

router.get('/otp', auth.mustLogout, (req, res) => {
  res.render('user/otp-login', { nav: true, footer: false })
})

router.get('/otp-login/:id', (req, res) => {
  mobile = req.params.id?.trim();

  client
    .verify
    .services(OTP.serviceId)
    .verifications
    .create({
      to: `+91${mobile}`,
      channel: 'sms'
    }).then((data) => {
      res.status(200).res.send(data)
    })

});

router.get('/otp-verify', (req, res) => {

  client
    .verify
    .services(OTP.serviceId)
    .verificationChecks
    .create({
      to: `+${req.query.mobileNumber}`,
      code: req.query.code
    }).then((data) => {
      if (data.valid) {

        mobile = req.query.mobileNumber.slice(2);
        console.log('mobile',mobile);

        userHelpers.getUserDetailsNo(mobile).then(user => {

          console.log('id',user[0]._id);
          console.log('3',user[0]);
          console.log('4',user);
          
          req.session.user = user[0]._id;
          res.send({ value: 'success' })

        });

        // res.status(200).send(data)
      } else {
        res.send({ value: 'failed' })
      }
    })
})

router.get('/shop', auth.verifyUser, (req, res) => {
  productHelpers.getAllProducts().then((products) => {
    res.render('user/shop', { products, nav: true, footer: true })
  })
});

router.get('/product/:id', auth.verifyUser, (req, res) => {
  let prodId = req.params.id
  productHelpers.getProductDetails(prodId).then((product) => {
    res.render('user/single-product', { product, nav: true, footer: true })
  })
})

router.get('/about-us', auth.verifyUser, (req, res) => {
  res.render('user/about-us', { nav: true, footer: true })
})

router.get('/wishlist', auth.verifyUser, (req, res) => {
  res.render('user/wishlist', { nav: true, foooter: true })
})
module.exports = router;
