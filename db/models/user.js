const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
          validator: validator.isEmail,
          message: '{VALUE} is not a valid email'
        }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(v) {
    	   return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(v)
      },
      message: 'Password must be at least 8 characters length and include at least: one uppercase character, one lowercase character, one number and a special character'
    }  
  },
  verified: {
    type: Boolean,
    required: true,
    default: false
  },
  confirmToken: {
    type: String
  },
  admin: {
    type: Boolean,
    default: false
  }  
});

UserSchema.statics.findByCredentials = function(email, password) {
  const User = this;
	return User.findOne({email}).then((user) => {
    if(!user) {
          return Promise.reject("Email or password is incorrect.");
		}
    return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
            	if(res) {
                resolve(user);
            	} else {
            		reject("Email or password is incorrect.");
            	}
            })
		})
	})
}

UserSchema.pre('save', function(next) {
	const user = this;
	if(user.isModified('password')) {
      bcrypt.genSalt(10, (err, salt) => {
      	bcrypt.hash(user.password, salt, (err, hash) => {
      		user.password = hash;
      		next();
      	})
      })
	} 
})

const User = mongoose.model('User', UserSchema);

module.exports = {User};

