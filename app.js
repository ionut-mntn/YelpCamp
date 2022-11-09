// if(process.env.NODE_ENV !== 'production'){
//     require('dotenv').config();
// }
require('dotenv').config();
// console.log(process.env.SECRET);
// console.log(process.env.API_KEY);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,  // deprecated
    useUnifiedTopology: true,
    // useFindAndModify: false // cica nu mai trebuie asta (si poate chiar nici cele de above!!)
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))

const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,  // might be the default these days..
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  // expire over a week
        maxAge: 1000 * 60 * 60 * 24 * 7 
    }
}

app.use(session(sessionConfig))
app.use(flash());
// app.use(helmet({ contentSecurityPolicy: false }));  // automatically enables all (11) middleware that helmet comes with!!
// app.use(helmet({ crossOriginEmbedderPolicy: false }));  // automatically enables all (11) middleware that helmet comes with!!
// app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dejwjwoqc/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dejwjwoqc/"],
            childSrc: ["blob:"]
        },
        // crossOriginEmbedderPolicy: false
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');  // whatever res.locals is, we'll have access to it in our templates automatically!! we don't have to pass it through!!
    res.locals.error = req.flash('error');  // whatever res.locals is, we'll have access to it in our templates automatically!! we don't have to pass it through!!
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.all('*', (req, res, next) => {   // runs for every single request (DAR CAREFUL: will run only if nothing else has matched first and we didn't respond from any of them!! (top-to-bottom))
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    // const { statusCode = 500, message = 'Something went wrong'} = err;
    // res.status(statusCode).send(message);
    // // res.send('Oh boy, something went wrong!');
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    const { statusCode = 500, message = 'Something went wrong'} = err;
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
     console.log('Serving on port 3000');
})