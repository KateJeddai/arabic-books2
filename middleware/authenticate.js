const ensureAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()) {
    console.log('user', req.user)
    return next();
  } else {
    res.redirect('/auth/login');
  }
}

const ensureAdmin = (req, res, next) => {
  if(req.isAuthenticated()) {
    console.log(req.user)
    if(req.user.admin) {
      return next();
    } else {
      res.render('admin-login.hbs', {
        message: 'Enter your admin credentials!'
      });
    }    
  } else {
    res.redirect('/auth/admin-login');
  }
}

module.exports = {ensureAuthenticated, ensureAdmin};
