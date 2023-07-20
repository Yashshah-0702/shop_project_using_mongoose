const mongoose = require('mongoose')
const Schema = mongoose.Schema
const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    resetToken:String,
    resetTokenExpirtion:Date,
    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }
        ]
    }

})
// Add To Cart
UserSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString()
    })
    let newQuantity = 1
    const updatedCartItems = [...this.cart.items]
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity
    }
    else {
        updatedCartItems.push({ productId: product._id, quantity: newQuantity })
    }
    //    product.quantity = 1
    const updatedCart = { items: updatedCartItems }
    this.cart = updatedCart
    return this.save()
}

// Delete items from cart
UserSchema.methods.deleteItemFromCart=function(productId){
    const updatedCart = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString()
    })
    this.cart.items=updatedCart
    return this.save()
}

// remove items from cart after ordering
UserSchema.methods.clearCart=function(){
    this.cart={items:[]}
    return this.save()
}

module.exports = mongoose.model('User', UserSchema)