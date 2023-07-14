const express = require('express')
const app = express()
const body = require('body-parser')
const route = require('./routes/route')
const error = require('./controller/error')
const mongoose = require('mongoose')
const User = require('./model/user')
const session = require('express-session')
const mongodbStore = require('connect-mongodb-session')(session);
const MongoUri = 'mongodb+srv://Yash_Shah:y_a_s_h@cluster0.h0nmwav.mongodb.net/shop'
const store = new mongodbStore({
    uri:MongoUri,
    collection:'session'
})

app.set('view engine','ejs')
app.set('views','views')

app.use(body.urlencoded({extended:false}))
app.use(session({secret:'my secret',resave:false,saveUninitialized:false,store:store})) // Sessions
  
app.use((req,res,next)=>{
    if (!req.session.user) {
        return next();
      }
      User.findById(req.session.user._id)
        .then(user => {
          req.user = user;
          next();
        })
        .catch(err => console.log(err));
})

app.use(route)
app.use(error.page)

mongoose.connect(MongoUri)
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
