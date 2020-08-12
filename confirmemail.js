require('./config/config.js');
const nodemailer = require('nodemailer');

const sendMail = (user, htmlMsg) => {
    const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                type: "OAuth2",
                user: process.env.APP_ADMIN,
                pass: process.env.ADMIN_PASS,
                serviceClient: process.env.CLIENT_ID,
                privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n")
              }
    });

    const mailOptions = {
              from: process.env.APP_ADMIN, 
              to: user.email, 
              subject: 'Confirm your email', 
              html: htmlMsg
    };

    transporter.sendMail(mailOptions, function (err, info) {
              if(err) console.log(err);
              else console.log(info);
    }); 
}
    
module.exports = {sendMail};
