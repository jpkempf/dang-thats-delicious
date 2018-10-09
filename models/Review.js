const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const reviewSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Please supply an author!'
    },
    store: {
        type: Schema.ObjectId,
        ref: 'Store',
        required: 'Please supply a store!'
    },
    text: {
        type: String,
        trim: true,
        required: 'Please supply a review text!'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
});

function autopopulate (next) {
    this.populate('author');
    next();
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Review', reviewSchema);