require('./config/config.js');
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground" 
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});
const accessToken = oauth2Client.getAccessToken();

const sendMail = (user, htmlMsg) => {
    const transporter = nodemailer.createTransport({        
            service: "gmail",
            auth: {
                 type: "OAuth2",
                 user: "arab.freeresources@gmail.com", 
                 clientId: process.env.CLIENT_ID,
                 clientSecret: process.env.CLIENT_SECRET,
                 refreshToken: process.env.REFRESH_TOKEN,
                 accessToken: accessToken,
                 tls: {
                    rejectUnauthorized: false
                 }
            }
    });

    const mailOptions = {
              from: "arab.freeresources@gmail.com", 
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
