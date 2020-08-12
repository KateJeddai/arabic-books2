const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureAdmin} = require('../middleware/authenticate');
const {renderAdminLoginPage, renderAdminPanel, adminLogin, addAdmin,
       renderSignupPage, renderLoginPage, renderRestorePassPage, renderResetForm,
       signupUser, verifyEmail, resendLinkToVerify, loginUser, signoutUser,
       sendEmailToRestorePass, resetPass} = require('../controllers/auth');
const passport = require('passport');

//ADMIN
router.get('/admin', ensureAdmin, renderAdminPanel, (err) => {
    res.render('error.hbs', {
        message: err.message
    });
})

router.get('/admin-login', renderAdminLoginPage);

router.post('/admin/add', ensureAdmin, addAdmin);

router.post('/admin/login', adminLogin);

// USER SIGNUP AND LOGIN 
router.get('/signup', renderSignupPage, (err) => {
    res.render('error.hbs', {
        message: err.message
    });
})

router.get('/login', renderLoginPage, (err) => {
    console.log(req.user)
    res.render('error.hbs', {
        message: err.message
    });
})

router.post('/users', signupUser);

router.get('/verify', verifyEmail);

router.get('/resend', resendLinkToVerify);

router.post('/users/login', loginUser);

// router.get('/signout', authenticate, signoutUser);
router.get('/signout', signoutUser);

// RESET PASSWORD 
router.get('/restore-password', renderRestorePassPage, (err) => {
    res.render('error.hbs', {
        message: err.message
    }); 
})

router.post('/restore', sendEmailToRestorePass);

router.get('/reset-form', renderResetForm);

router.post('/reset-pass', resetPass);

module.exports = router;
