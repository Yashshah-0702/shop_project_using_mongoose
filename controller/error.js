exports.page = (req, res) => {
  res.render("error", {
    isAuthenticated: req.session.isLoggedIn,
  });
};
