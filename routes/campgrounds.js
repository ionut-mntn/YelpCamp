const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');

// app.use(asdasd, asdasd) // NU! We don't wnat this to be run for each of our routes! We want this to be selectively applied!
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    }
    next(); // never forget this in a middleware!!
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))
router.get('/new', (req, res) => {  // asta dc nu e async? ori va fi..?
    res.render('campgrounds/new');
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // console.log('intra unde trebuie POST!')

    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground (req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);  // nu trebuie schimbat si aici??
}))

router.get('/:id', catchAsync(async (req, res) => {
    // const campground = await Campground.findById(req.params.id);
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground){
        req.flash('error', 'Cannot find that campground!');
        // res.redirect('/campgrounds');  // e bn sa returnam, cica!!
        return res.redirect('/campgrounds');  
    }
    // console.log(campground);  // just to see what we are dealing with
    res.render('campgrounds/show', { campground} );
}))


router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground){
        req.flash('error', 'Cannot find that campground!');
        // res.redirect('/campgrounds');  
        return res.redirect('/campgrounds');  
    }
    res.render('campgrounds/edit', { campground });
}))

router.put('/:id', validateCampground, catchAsync( async(req, res) => {  // mare atentie la chestii de genul!! Nuj dc fara primul slash nu o sa mearga!! Desi eroarea zice clar ca a interpertat cu "/" chit ca eu nu am pus "/"!!
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // la fel de bine mergea si req.body.campground direct fara destructuring + capturing in a new object!!
    // req.flash('succes', 'Successfully updated campground!')  / grija mari la greseli de genul!!
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', catchAsync( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Sucessfully deleted campground')
    res.redirect('/campgrounds');  // nu trebuie schimbat si aici?
}))

module.exports = router;