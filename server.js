// cd../../Program Files/MongoDB/server/4.0/bin
require('./config/config.js');
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const fs = require('fs');
const session = require('express-session');
const _ = require('lodash');
const passport = require('passport');
const {localStrategy} = require('./config/passport');
const {localAdminStrategy} = require('./config/passport-admin');
const {mongoose} = require('./db/mongoose');
const MongoStore = require('connect-mongo')(session); 
const {User} = require('./db/models/user');
const {getHolidays} = require('./controllers/holidays');
const {getTodayDate, getTodayYear, getTodayDateAr, getHijriDate} = require('./helpers/dates');

const app = express();
const port = process.env.PORT;  

// passport config
//require('./config/passport')(passport);
passport.use('local', localStrategy);
passport.use('local.admin', localAdminStrategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
}) 
  
passport.deserializeUser((id, done) => {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

const conn = mongoose.connection;
conn.on('connected', () => {
    console.log(process.env.MONGODB_URI);
    app.locals.db = conn.db;
})

const sessionStore = new MongoStore({ mongooseConnection: conn, collection: 'sessions' })

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Cache-Control", "no-cache, no-store, must-revalidate"); 
    next();
});

app.use(express.json({limit:'500mb'})); 
app.use(express.urlencoded({limit: "500mb", extended: true, parameterLimit:500000}));
app.use(express.static(path.join(__dirname, '/public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore 
}));

app.use(passport.initialize());
app.use(passport.session());

const auth = require('./routes/auth');
const books = require('./routes/books');
const holidays = require('./routes/holidays');
app.use('/auth', auth);
app.use('/books', books);
app.use('/holidays', holidays);

app.set('view engine', hbs);
hbs.registerPartial('header', fs.readFileSync(__dirname + '/views/partials/header.hbs', 'utf8'));
hbs.registerPartial('aside', fs.readFileSync(__dirname + '/views/partials/aside.hbs', 'utf8'));
hbs.registerPartial('footer', fs.readFileSync(__dirname + '/views/partials/footer.hbs', 'utf8'));
//hbs.registerPartials(path.join(__dirname, '/views/partials'));
hbs.registerHelper('getTodayDate', getTodayDate);
hbs.registerHelper('getTodayYear', getTodayYear);
hbs.registerHelper('getTodayDateAr', getTodayDateAr);
hbs.registerHelper('getHijriDate', getHijriDate);


// main page
app.get('/', getHolidays, (req, res) => {
    res.render('arab.hbs', { 
        holidays: req.hols,
        username: req.user ? req.user.username : null,
        loggedIn: req.user ? true : false
    });
}, (err) => {
    res.status(400).send(err);
})

app.get('/links', getHolidays, (req, res) => {
    res.render('links.hbs', { 
        holidays: req.hols,
        username: req.user ? req.user.username : null,
        loggedIn: req.user ? true : false
    });
}, (err) => {
    res.status(400).send(err);
})

// FOR ALL NON-EXISTING ROUTES
app.all('*', (req, res) => {
  res.redirect('/');
});

app.listen(port, () => {
    console.log(`App started on port ${port}`);
})

