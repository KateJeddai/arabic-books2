const _ = require('lodash');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {User} = require('../db/models/user');
const {ensureAuthenticated, ensureAdmin} = require('../middleware/authenticate');
const {sendMail} = require('../confirmemail');

// ADMIN
const renderAdminLoginPage = (req, res, next) => {
    if(req.isAuthenticated()) {
        res.redirect('/');
    }
    res.render('admin-login.hbs');
} 

const renderAdminPanel = (req, res, next) => {
    res.render('admin.hbs', {
        loggedIn: req.user ? true : false
    });
}

const addAdmin = async (req, res) => {
    var body = _.pick(req.body, ['username', 'email', 'password']);
    const user = new User({
        username: body.username,
        email: body.email,
        password: body.password,
        admin: true,
        verified: true
    });
    try {
        await user.save();
        res.redirect('/auth/admin');
    } catch(err) {
        res.render('admin.hbs', {
            message: err.message,
            loggedIn: req.user ? true : false
        });
    }
}

const adminLogin = async (req, res, next) => {
    passport.authenticate('local.admin', {
        successRedirect: '/auth/admin',
        failureRedirect: '/auth/admin-login'
    })(req, res, next);      
}

// USERS AUTHENTICATION
// render pages 
const renderSignupPage = (req, res) => {
    if(req.isAuthenticated()) {
       res.redirect('/');
    }  
    res.render('signup.hbs');
}

const renderLoginPage = (req, res) => {
    const origUrl = req.query.origUrl && req.query.origUrl.split(' ').join('+');
    if(req.isAuthenticated()) {
        res.redirect('/');
    }
    res.render('login.hbs', {
        message: req.query.message ? req.query.message : null,
        origUrl: origUrl
    });
}

const renderRestorePassPage = (req, res) => {
    res.render('restore-pass.hbs');
}

const renderResetForm = async (req, res) => {    
    const confirmToken = req.query.token;  
    try {        
        const decoded = jwt.verify(confirmToken, process.env.JWT_SECRET);
        const user = await User.findOne({confirmToken});
        res.cookie('token', confirmToken, { httpOnly: true });
        res.render('reset-form.hbs');        
    } catch(err) {
        if(err.message === 'jwt expired') {
            res.render('restore-pass.hbs', {
                message: "The link has expired.",
                id: user._id 
            });
        } else {
            res.render('restore-pass.hbs', {
                message: err.message
            })
        }
    }
}

// signup a new user 
const signupUser = async (req, res) => {
    const body = _.pick(req.body, ['username', 'email', 'password', 'copypassword']);  
    const form = {
        usernameholder: body.username,
        emailholder: body.email
    };
    const user = new User(body);
          user.verified = false;
          user.confirmToken = jwt.sign({username: user.username}, 
                                        process.env.JWT_SECRET, 
                                       {expiresIn: '24h'}).toString();
    try {
        await user.save();
        const link = "http://" + req.get('host') + "/auth/verify?token=" + user.confirmToken;
        const htmlMsg = "Please, click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>";
        sendMail(user, htmlMsg);
        res.render('signup.hbs', {
            message: 'Please, check your email for a confirmation link!',
            id: user._id
        });
    } catch(err){
        if(err.name === 'MongoError') {
            const formData = {username: '', email: ''};
            if((RegExp('username')).test(err.errmsg) && (RegExp('duplicate')).test(err.errmsg)) {
                formData.username = 'Username is already in use';
            }  
            if((RegExp('email')).test(err.errmsg) && (RegExp('duplicate')).test(err.errmsg)) {
                formData.email = 'Email is already in use';
            }
            res.render('signup.hbs', {
                errors: err,  
                formData,
                form
            })
        }
        else { 
            res.render('signup.hbs', {
                errors: err,
                formData: {
                    username: err.toJSON().errors['username'] ? err.toJSON().errors['username'].message : null,
                    email: err.toJSON().errors['email'] ? err.toJSON().errors['email'].message : null,
                    password: err.toJSON().errors['password'] ? err.toJSON().errors['password'].message : null
                },
                form
            });
        }
    }   
}

// verify user's email
const verifyEmail = async (req, res) => {
    if(req.isAuthenticated()) {
        res.render('login.hbs', {
            loggedinMsg: "You've already logged in.",
            username: req.user.username,
            loggedIn: true
        });
    } else {
        const confirmToken = req.query.token;
        const user = await User.findOne({confirmToken});
        if(!user) {
            res.render('signup.hbs', {
                message: "User not found."
            });
        }
        try {
            const decoded = jwt.verify(confirmToken, process.env.JWT_SECRET);        
            await User.updateOne({ email: user.email }, { '$set': { verified: true }});                   
            res.render('login.hbs', {
               confirmation: 'Your email has been confirmed.'
            });
        } catch(err) {
            if(err.message === 'jwt expired') {
                res.render('signup.hbs', {
                    message: "Confirmation link has expired.",
                    id: user._id 
                });
            } else {
                res.render('signup.hbs', {
                    message: err.message
               })
            }          
        }
    } 
} 

// resend link to verify email
const resendLinkToVerify = async (req, res) => {
    const id = req.query.user;
    try{
      const user = await User.findOne({_id: id});
      const confirmToken = jwt.sign({username: user.username}, 
                                    process.env.JWT_SECRET, 
                                    { expiresIn: '24h' }).toString();
      await User.updateOne({_id: id}, { '$set': { confirmToken }});
      const link = "http://" + req.get('host') + "/auth/verify?token=" + confirmToken;
      const htmlMsg = "Please, click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>";
            sendMail(user, htmlMsg);        
            res.render('signup.hbs', {
              message: 'Please, check your email for a confirmation link!',
              id: user._id
            });
             
    } catch(err) {
        res.render('signup.hbs', {
              message: 'Something went wrong. Try again later.'
        });
    }
}

const loginUser = (req, res, next) => {
    let origUrl = req.body.origUrl ? req.body.origUrl.split('+').join(' ') : null;        
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login'
    })(req, res, next);
}

const signoutUser = (req, res) => {
    req.logout();
    res.redirect('/');
}

// restore password
const sendEmailToRestorePass = async (req, res) => {
    const email = req.body.email;
    try {
        const user = await User.findOne({email});
        if(!user) {
            res.render('restore-pass.hbs', {
                message: 'User with such email doesn\'t exist.'
            });
        } else {
            const confirmToken = jwt.sign({_id: user._id.toHexString()}, 
                                           process.env.JWT_SECRET, 
                                           { expiresIn: '24h' }).toString();
            await User.updateOne({email}, { '$set': { confirmToken }});
            const link = "http://" + req.get('host') + "/auth/reset-form?token=" + confirmToken;
            const htmlMsg = "To create a new password, please follow the link below.<br><a href=" + link + ">Click here.</a>";
            sendMail(user, htmlMsg);
            res.render('restore-pass.hbs', {
                message: 'Instruction how to change your password was sent to your email.'
            });
        }        
    } catch(err) {
        res.render('restore-pass.hbs', {
            message: err
        });
    }
}

const resetPass = async (req, res) => {
    const {password} = req.body;
    const confirmToken = req.user.confirmToken;
    try {  
        const user = await User.findOne({confirmToken});
        user.password = password;
        await user.save();
        res.render('restore-pass.hbs', {
            message_change: 'The password has been changed.' 
        });
    } catch(err) {
        res.render('restore-pass.hbs', {
            message: err
        });
    }
}

module.exports = {
    renderAdminLoginPage,
    renderAdminPanel,
    addAdmin,
    adminLogin,
    renderSignupPage,
    renderLoginPage,
    renderRestorePassPage,
    renderResetForm,
    signupUser,
    verifyEmail,
    resendLinkToVerify,
    loginUser,
    signoutUser,
    sendEmailToRestorePass,
    resetPass
}
