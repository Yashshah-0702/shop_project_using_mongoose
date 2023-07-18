const Product = require("../model/model");
const Order = require("../model/order");
const User = require("../model/user");
const bcrypt = require("bcryptjs");

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
  Product.find()
    .then((row) => {
      res.render("products", {
        products: row,
        editing: false,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
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
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      return product.save();
    })
    .then((result) => {
      console.log("Updated...");
      res.redirect("/products");
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
  Product.findByIdAndRemove(prodId)
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
          name: req.user.name,
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
  res.render("login", {
    isAuthenticated: false,
  });
};

// postlogin
exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/products');
            });
          }
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

// Deleteing a Cookie
exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/products");
  });
};

// Authentication
// Sign-up page
exports.getSignUp = (req, res) => {
  res.render("signup", {
    isAuthenticated: false,
  });
};

exports.postSignUp = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
        });
    })
    .catch(err => {
      console.log(err);
    });
  };
