const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // store the URL they are requesting!
        // console.log(req.path, req.originalURL);
        console.log(req.path, req.originalUrl);
        req.session.returnTo = req.originalUrl;  // where we want to redirect a user back to!!
        console.log(`setat req.sessino.returnTo to ${req.originalUrl}. Curr value: ${req.session.returnTo}`);
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// app.use(asdasd, asdasd) // NU! We don't wnat this to be run for each of our routes! We want this to be selectively applied!
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    }
    next(); // never forget this in a middleware!!
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);  // always remember ti 
    }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;  // !!
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);  // always remember ti 
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    }
    next(); // never forget this in a middleware!!
}