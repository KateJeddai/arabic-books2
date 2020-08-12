const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {User} = require('../db/models/user');

const localStrategy = new LocalStrategy({ usernameField: 'email'}, async (email, password, done ) => {
            try {
                const user = await User.findOne({email: email});
                if(!user) {
                    return done(null, false, { message: 'The email is not registered' });
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) throw new Error(err);
                    if(isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password is incorrect'});
                    }
                })
            } catch(err) {
                console.log(err)
            }
        })

module.exports = {localStrategy};
