const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // console.log('intra unde trebuie POST!')

    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await campground.save();
    console.log(`campground aici: ${campground}`);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);  // nu trebuie schimbat si aici??
}

module.exports.showCampground = async (req, res) => {
    // const campground = await Campground.findById(req.params.id);
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        // res.redirect('/campgrounds');  // e bn sa returnam, cica!!
        return res.redirect('/campgrounds');
    }
    // console.log(campground);  // just to see what we are dealing with
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        // res.redirect('/campgrounds');  
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {  // mare atentie la chestii de genul!! Nuj dc fara primul slash nu o sa mearga!! Desi eroarea zice clar ca a interpertat cu "/" chit ca eu nu am pus "/"!!
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // la fel de bine mergea si req.body.campground direct fara destructuring + capturing in a new object!!
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    // req.flash('succes', 'Successfully updated campground!')  / grija mari la greseli de genul!!
    await campground.save();

    if(req.body.deleteImages){
        for(let fileName of req.body.deleteImages){
            await cloudinary.uploader.destroy(fileName);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground)
    }

    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Sucessfully deleted campground')
    res.redirect('/campgrounds');  // nu trebuie schimbat si aici?
}