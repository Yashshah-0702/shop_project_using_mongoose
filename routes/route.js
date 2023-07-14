const express = require('express')
const router = express.Router()
const control = require('../controller/process')

router.get('/',control.process)
router.get('/products/:productId',control.getProduct)
router.get('/products',control.output)
router.post('/items',control.items)
router.post('/cart',control.postcart)
router.get('/order',control.getOrders)
router.get('/editproducts/:productId',control.editProduct)
router.post('/edit-product',control.postEditProduct)
router.post('/delete-product',control.postDeleteProduct)
router.get('/cart',control.getCarts)
router.post('/cart-delete-item',control.postcartdelete)
router.post('/create-order',control.postOrder)
router.get('/login',control.getLogin)
router.post('/login',control.postLogin)
router.post('/logout',control.postLogout)
router.get('/signup',control.getSignUp)
router.post('/signup', control.postSignUp);

module.exports =router