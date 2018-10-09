const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const slug = require('slugs');
const storeSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name',
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String,
            required: 'You must supply an address!'
        }
    },
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'Please supply an author!'
    }
}, { // config object
    toJSON: { virtuals: true }, // show virtual fields show up in json dumps
    toObject: { virtuals: true },
});

storeSchema.index({
    name: 'text',
    description: 'text'
});

storeSchema.index({
    location: '2dsphere'
})

storeSchema.pre('save', async function(next) {
    if (!this.isModified('name')) return next();

    this.slug = slug(this.name);

    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const similarSlugs = await this.constructor.find({ slug: slugRegEx });

    if (similarSlugs.length) this.slug = `${this.slug}-${similarSlugs.length + 1}`;

    next();
});

storeSchema.statics.getTagsList = function() {
    return this.aggregate([
        { $unwind: '$tags'},
        { $group: { _id: '$tags', count: { $sum: 1 }}},
        { $sort: { count: -1 }}
    ]);
}

storeSchema.statics.getTopStores = function() {
    return this.aggregate([
        // get stores, populate their reviews
        // this is basically the same as the virtual reviews field
        // but directly in mongodb
        { $lookup: {
            from: 'reviews', // ref: 'Review'
            localField: '_id', // the store id
            foreignField: 'store', // the same id in the reviews
            as: 'reviews' // name of the new field on the aggregate
        }},

        // filter for stores with >2 reviews
        // test for reviews[1], i.e. reviews array has at least 2 elements
        { $match: { 'reviews.1': { $exists: true }}},

        // add new field for average review score
        { $addFields: {
            averageRating: { $avg: '$reviews.rating' }
        }},

        // sort by average review score
        { $sort: { averageRating: -1 }},

        // limit to top 10 results
        { $limit: 10 }
    ]);
}

storeSchema.virtual('reviews', {
    ref: 'Review', // what model to link with Store
    localField: '_id', // name of the field on the Store
    foreignField: 'store' // name of the field on the Review
});

function autopopulate(next) {
    this.populate('reviews');
    next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);