const express = require('express');
const router = express.Router({mergeParams: true});

const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas');


const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    }
    next(); // never forget this in a middleware!!
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); // remember how we structured the request body in show.ejs!! (doing stuff like: review[rating], review[body])
    campground.reviews.push(review); 
    await review.save();
    await campground.save();
    // res.send('YOU MADE IT!!');
    // res.redirect(`campgrounds/${campground._id}`);
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`); // F IMPORATNTE SLASH-URILE ASTEA IN PATH-URI!!!!
}))

router.delete('/:reviewID', catchAsync( async(req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;