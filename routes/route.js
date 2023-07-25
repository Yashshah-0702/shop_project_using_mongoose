const express = require("express");
const router = express.Router();
const control = require("../controller/process");
const isAuth = require("../middleware/is-auth");
const { check, body } = require("express-validator");
const User = require("../model/user");

router.get("/", isAuth, control.process);
router.get("/products/:productId", isAuth, control.getProduct);
router.get("/products", control.output);
router.post("/items",[
  body("title").isString().isLength({min:3}).trim(),
  body("price").trim().isFloat(),
  body("description").isLength({min:5,max:400}).trim()
], isAuth, control.items);
router.get("/prod", control.getShop);
router.post("/cart", isAuth, control.postcart);
router.get("/order", isAuth, control.getOrders);
router.get("/editproducts/:productId",isAuth, control.editProduct);
router.post("/edit-product",[
  body("title").isString().isLength({min:3}).trim(),
  body("description").isLength({min:5,max:400}).trim(),
  body("price").isFloat().trim()
], isAuth, control.postEditProduct);
router.post("/delete-product", isAuth, control.postDeleteProduct);
router.get("/cart", isAuth, control.getCarts);
router.post("/cart-delete-item", isAuth, control.postcartdelete);
router.post("/create-order", isAuth, control.postOrder);
router.get("/login", control.getLogin);
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password", "Password has to be valid.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  control.postLogin
);
router.post("/logout", control.postLogout);
router.get("/signup", control.getSignUp);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter a valid email...!")
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("This email is forbidden...!");
        // }
        // return true;
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email exists already , please pickup a new one...!"
            );
          }
        });
      })
      .normalizeEmail(),
    // validate password
    body(
      "password",
      "Password must be a text or number or at least 5 character long"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    // check with confirm password
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Please check passwords , they are not matching...!");
        }
        return true;
      }),
  ],
  control.postSignUp
); // adding validation
router.get("/reset", control.getReset);
router.post("/reset", control.postReset);
router.get("/reset/:token", control.getNewPassword);
router.post("/newpassword", control.postNewPassword);
router.get('/orders/:orderId',isAuth,control.getInvoice)

module.exports = router;
