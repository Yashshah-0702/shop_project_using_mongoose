const express = require("express");
const app = express();
const body = require("body-parser");
const path = require('path')
const route = require("./routes/route");
const error = require("./controller/error");
const mongoose = require("mongoose");
const User = require("./model/user");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session);
const MongoUri =
  // "mongodb+srv://Yash_Shah:y_a_s_h@cluster0.h0nmwav.mongodb.net/shop";
  "mongodb://localhost:27017/"
const csrf = require("csurf");
const csrfProtection = csrf();
const flash = require('connect-flash')

const store = new mongodbStore({
  uri: MongoUri,
  collection: "session",
});
const multer = require('multer')
const fileFilter = (req,file,cb)=>{
  if(file.mimetype==="image/png" || file.mimetype==="image/jpg" || file.mimetype==="image/jpeg"){
    cb(null,true)
  }
  else{
    cb(null,false)
  }
}
const fileStorage = multer.diskStorage({
  destination:((req,file,cb)=>{
      cb(null,'images')
  }),
  filename:((req,file,cb)=>{
    cb(null,new Date().toISOString() + '-' + file.originalname)
  })
  
})

app.set("view engine", "ejs");
app.set("views", "views");

app.use(body.urlencoded({ extended: false }));
app.use((multer({storage:fileStorage,fileFilter:fileFilter})).single('image'))
app.use('/images',express.static(path.join(__dirname,'images')))
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
); // Sessions

app.use(csrfProtection)
app.use(flash())
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      // throw new Error('dummy')
      if(!user){
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {next(new Error(err))});
});


app.use(route);
app.get('/500',error.page500)
app.use(error.page);
app.use((error,req,res,next)=>{
  // res.redirect('/500')
  res.status(500).render("505", {
    isAuthenticated: req.session.isLoggedIn,
  });
})
mongoose
  .connect(MongoUri)
  .then((result) => {
    console.log("Connected to Database...")
    app.listen(7900);
  })
  .catch((err) => console.log(err));
