exports.page = (req, res) => {
  res.status(400).render("error", {
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.page500 = (req, res) => {
  res.status(500).render("505", {
    isAuthenticated: req.session.isLoggedIn,
  });
};
