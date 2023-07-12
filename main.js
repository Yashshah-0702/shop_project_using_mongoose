const express = require('express')
const app = express()
const body = require('body-parser')
const route = require('./routes/route')
const error = require('./controller/error')
const mongoose = require('mongoose')
const User = require('./model/user')

app.set('view engine','ejs')
app.set('views','views')

app.use(body.urlencoded({extended:false}))
  
app.use((req,res,next)=>{
    User.findById('64acf130b5a4a84d53b26e87')
    .then(user=>{
        req.user=user
        next()
    })
    .catch(err=>console.log(err));
})

app.use(route)
app.use(error.page)

mongoose.connect('mongodb+srv://Yash_Shah:y_a_s_h@cluster0.h0nmwav.mongodb.net/shop')
.then((result)=>{
    User.findOne().then(user=>{
        if(!user){
           const user = new User({
            name:"yash shah",
            email:"yash@gmail.com",
            cart:{
                items:[]
            }
           })
          return user.save()
        }
    })
    console.log("Connected To Database....")
    app.listen(7500)
})
.catch(err=>console.log(err))
