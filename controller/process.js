const Product = require("../model/model");
const Order = require("../model/order");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

// sending mail
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yash72200002@gmail.com",
    pass: "xszbemuusaprolkp",
  },
});

exports.process = (req, res) => {
  res.render("editing", {
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
  });
};

// Adding a Product (Create)
exports.items = (req, res) => {
  const product = new Product({
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      console.log("Added Product");
      res.redirect("/products");
    })

    .catch((err) => {
      console.log(err);
    });
};

// Reading A Single Product (Read)
exports.getProduct = (req, res) => {
  const prodId = req.params.productId;
  // Product.findAll({where:{id:prodId}}).then(product=>{
  //   res.render('details',{product:product[0]})}).catch(err=>console.log(err))
  Product.findById(prodId)
    .then((product) => {
      res.render("details", {
        product: product,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// Reading All Product (Read)
exports.output = (req, res) => {
  Product.find({ userId: req.user._id })
    // Product.find()
    .then((row) => {
      res.render("products", {
        products: row,
        editing: false,
        // isAuthenticated: req.session.isLoggedIn,
        // csrfToken:req.csrfToken()
      });
    })
    .catch((err) => console.log(err));
};

exports.getShop = (req, res) => {
  Product.find().then((row) => {
    res.render("shop_prod", { products: row });
  });
};

// Editing A product(Update)
// it is used for posting editing details in databse
exports.postEditProduct = (req, res) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/prod");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      return product.save().then((result) => {
        console.log("Updated...");
        res.redirect("/prod");
      });
    })
    .catch((err) => console.log(err));
};

// When user click on edit this will showed to user and helps it to edit page
// it is used for get
exports.editProduct = (req, res) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("editing", {
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// // Deleting A product(Delete)
exports.postDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  // Product.findByIdAndRemove(prodId)
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      console.log("Product Deleted");
      res.redirect("/products");
    })
    .catch((err) => console.log(err));
};

// Cart Side
// Geting Cart
exports.getCarts = (req, res) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("cart", {
        products: products,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Storing product in cart
exports.postcart = (req, res) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

// Delete Cart
exports.postcartdelete = (req, res) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

// // Order Side

exports.postOrder = (req, res) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/order");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("order", {
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// Session & Cookies
// Login Page
exports.getLogin = (req, res) => {
  //const isLoggedIn = req.get('Cookie').split('=')[1]==='true' // getting cookie
  // const isLoggedIn = req.session.isLoggedIn
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("login", {
    isAuthenticated: false,
    errorMessaage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

// postlogin
exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('login', {
      isAuthenticated: false,
      errorMessaage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render('login', {
          isAuthenticated: false,
          errorMessaage: errors.array()[0].msg,
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/prod");
              return transporter.sendMail({
                to: email,
                from: "yash72200002@gmail.com",
                subject: "Login Succedded!",
                html: "<h1>You have successfully Login in website...!</h1>",
              });
            });
          }
          return res.status(422).render('login', {
            isAuthenticated: false,
            errorMessaage: errors.array()[0].msg,
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

// Deleteing a Cookie
exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/prod");
  });
};

// Authentication
// Sign-up page
exports.getSignUp = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("signup", {
    isAuthenticated: false,
    errorMessaage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors:[]
  });
};

exports.postSignUp = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error.array());
    return res.status(422).render("signup", {
      isAuthenticated: false,
      errorMessaage: error.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
    validationErrors:error.array()
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      // email sending
      return transporter.sendMail({
        to: email,
        from: "yash72200002@gmail.com",
        subject: "SignUp Succedded!",
        html: "<h1>You have successfully signed up.</h1>",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Advance Authentication
// getreset
exports.getReset = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("reset", {
    errorMessaage: message,
  });
};
// postreset
exports.postReset = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "Email Not Found..!");
          res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpirtion = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/products");
        // email sending
        return transporter.sendMail({
          to: req.body.email,
          from: "yash72200002@gmail.com",
          subject: "Password Reset!",
          html: `
            <p>You Have Requested For Reset Password.....</p>
            <p>Click Here on this <a href="http://localhost:7900/reset/${token}">link</a> to change password.</p>`,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpirtion: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("new-password", {
        errorMessaage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpirtion: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpirtion = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
      // transporter.sendMail({
      //   to:User.email,
      //   from: "yash72200002@gmail.com",
      //       subject: "Password Resetted succesfully!",
      //       html: `
      //       <p>You Have Succefully Resetted Password...!</p>`
      // })
    })
    .catch((err) => console.log(err));
};

// Validation
