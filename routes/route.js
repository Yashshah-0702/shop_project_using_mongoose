const express = require('express')
const router = express.Router()
const control = require('../controller/process')
const isAuth = require('../middleware/is-auth')

router.get('/',isAuth,control.process)
router.get('/products/:productId',isAuth,control.getProduct)
router.get('/products',control.output)
router.post('/items',isAuth,control.items)
router.post('/cart',isAuth,control.postcart)
router.get('/order',isAuth,control.getOrders)
router.get('/editproducts/:productId',isAuth,control.editProduct)
router.post('/edit-product',isAuth,control.postEditProduct)
router.post('/delete-product',isAuth,control.postDeleteProduct)
router.get('/cart',isAuth,control.getCarts)
router.post('/cart-delete-item',isAuth,control.postcartdelete)
router.post('/create-order',isAuth,control.postOrder)
router.get('/login',control.getLogin)
router.post('/login',control.postLogin)
router.post('/logout',control.postLogout)
router.get('/signup',control.getSignUp)
router.post('/signup', control.postSignUp);

module.exports =router