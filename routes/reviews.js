const express = require('express');
const router = express.Router({mergeParams: true});
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); // remember how we structured the request body in show.ejs!! (doing stuff like: review[rating], review[body])
    review.author = req.user._id;
    campground.reviews.push(review); 
    await review.save();
    await campground.save();
    // res.send('YOU MADE IT!!');
    // res.redirect(`campgrounds/${campground._id}`);
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`); // F IMPORATNTE SLASH-URILE ASTEA IN PATH-URI!!!!
}))

router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync( async(req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;