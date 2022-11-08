const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

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

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // YOUR USER ID
            author: '6368ce99180d564696e85bbf',  // all belong to Tim rn
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: 'https://source.unsplash.com/collection/483251',
            // imagse: [ // grija la greseli de genul!! Cred ca de asta nu vedea imaginile!!
            images: [
                {
                    url: 'https://res.cloudinary.com/dejwjwoqc/image/upload/v1667906323/YelpCamp/awqdvhg3ygb6dwhtvjrr.png',
                    filename: 'YelpCamp/awqdvhg3ygb6dwhtvjrr',
                },
                {
                    url: 'https://res.cloudinary.com/dejwjwoqc/image/upload/v1667906324/YelpCamp/urwy3z9utq0qxdftyaqa.png',
                    filename: 'YelpCamp/urwy3z9utq0qxdftyaqa',
                },
                {
                    url: 'https://res.cloudinary.com/dejwjwoqc/image/upload/v1667906324/YelpCamp/vgqfqnjtbm2g905pi3df.jpg',
                    filename: 'YelpCamp/vgqfqnjtbm2g905pi3df',
                },
                {
                    url: 'https://res.cloudinary.com/dejwjwoqc/image/upload/v1667906325/YelpCamp/uk7a2szzjwymq1ateomm.jpg',
                    filename: 'YelpCamp/uk7a2szzjwymq1ateomm',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                // coordinates: [-113.1331, 47.0202]
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            }
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});