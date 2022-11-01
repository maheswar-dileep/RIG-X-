var express = require('express');
var router = express.Router();
var nav = true
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {nav:true,footer:true });
});

router.get('/login',(req,res)=>{
  res.render('user/user-login',{nav:false,footer:false})
})

router.get('/signup',(req,res)=>{
  res.render('user/signup',{nav:false,footer:false})
})

router.get('/otp-login',(req,res)=>{
  res.render('user/otp-login',{nav:false,footer:false})
})

router.get('/shop',(req,res)=>{
  res.render('user/shop',{nav:true, footer:true})
})

router.get('/single-product',(req,res)=>{
  res.render('user/single-product',{nav:true,footer:true})
})

router.get('/about-us',(req,res)=>{
  res.render('user/about-us',{nav:true,footer:true})
})

router.get('/wishlist',(req,res)=>{
  res.render('user/wishlist',{nav:true,foooter:true})
})
module.exports = router;
