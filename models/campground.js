const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {  // this is a query middleware!! And it's going to pass in the deleted doc!!
    console.log(`DELETED:\n${doc}`);
    if(doc){
        await Review.deleteMany({_id: {$in: doc.reviews}})
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);