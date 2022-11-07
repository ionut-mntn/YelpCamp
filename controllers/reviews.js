const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
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
}

module.exports.deleteReview = async(req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
}