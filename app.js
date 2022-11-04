const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,  // deprecated
    useUnifiedTopology: true
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


// app.use(asdasd, asdasd) // NU! We don't wnat this to be run for each of our routes! We want this to be selectively applied!
const validateCampground = (req, res, next) => {
    console.log('intraaaa!!!')
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    }
    next(); // never forget this in a middleware!!
}
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    }
    next(); // never forget this in a middleware!!
}

app.get('/', (req, res) => {
    res.render('home')
})
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))
app.get('/campgrounds/new', (req, res) => {  // asta dc nu e async? ori va fi..?
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // console.log('intra unde trebuie POST!')

    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground (req.body.campground);
    await campground.save();
     res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    // const campground = await Campground.findById(req.params.id);
    const campground = await Campground.findById(req.params.id).populate('reviews');
    // console.log(campground);  // just to see what we are dealing with
    res.render('campgrounds/show', { campground} );
}))


app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

app.put('/campgrounds/:id', validateCampground, catchAsync( async(req, res) => {  // mare atentie la chestii de genul!! Nuj dc fara primul slash nu o sa mearga!! Desi eroarea zice clar ca a interpertat cu "/" chit ca eu nu am pus "/"!!
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // la fel de bine mergea si req.body.campground direct fara destructuring + capturing in a new object!!
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); // remember how we structured the request body in show.ejs!! (doing stuff like: review[rating], review[body])
    campground.reviews.push(review); 
    await review.save();
    await campground.save();
    // res.send('YOU MADE IT!!');
    // res.redirect(`campgrounds/${campground._id}`);
    res.redirect(`/campgrounds/${campground._id}`); // F IMPORATNTE SLASH-URILE ASTEA IN PATH-URI!!!!
}))

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