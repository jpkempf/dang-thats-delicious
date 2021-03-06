const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');

const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({ message: 'That file type is not allowed!'}, false);
        }
    }
}

exports.getStores = async (req, res) => {
    const page = req.params.page || 1;
    const limit = 9;
    const skip = (page * limit) - limit;

    const storesPromise = Store
        .find()
        .skip(skip)
        .limit(limit);

    const countPromise = Store.count();

    const [stores, count] = await Promise.all([
        storesPromise,
        countPromise
    ]);

    const pages = Math.ceil(count / limit);

    if (!stores.length && skip) {
        req.flash('info', `Page ${page} does not exist. Redirecting to the last page instead.`)
        res.redirect(`/stores/page/${pages}`);

        return;
    }

    res.render('getStores', {
        title: 'Stores',
        stores, page, pages, count
    });
}

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store
        .findOne({ slug: req.params.slug })
        .populate('author reviews');

    if (!store) return next();

    res.render('getStore', { title: store.name, store });
}

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Add store' });
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    if (req.file) {
        const photo = await jimp.read(req.file.buffer)
        const extension = req.file.mimetype.split('/')[1];

         req.body.photo = `${uuid.v4()}.${extension}`;

         await photo.resize(800, jimp.AUTO);
         await photo.write(`./public/uploads/${req.body.photo}`);
    }

    next();
}

exports.createStore = async (req, res) => {
    req.body.author = req.user._id;

    const store = await (new Store(req.body)).save();

    req.flash('success', `Successfully created store ${store.name}!`);
    res.redirect(`/stores/${store.slug}`);
}

exports.updateStore = async (req, res) => {
    req.body.location.type = 'Point';

    const store = await Store.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    ).exec();

    req.flash('success', `Changes to ${store.name} saved!`);
    res.redirect(`/stores/${store.slug}`);
}

const confirmOwner = (store, user) => store.author.equals(user._id);

exports.editStore = async (req, res) => {
    const store = await Store.findById(req.params.id);
    const userOwnsStore = confirmOwner(store, req.user);

    if (!userOwnsStore) {
        req.flash('error', 'You can only edit stores you own!');
        res.redirect('/stores');
    }

    res.render('editStore', { title: `Edit ${store.name}`, store });
}

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const [ tags, stores ] = await Promise.all([
        Store.getTagsList(),
        Store.find({ tags: tag || { $exists: true } }),
    ]);

    res.render('getStoresByTag', {
        title: tag || 'Tags',
        tag, tags, stores
    });
}

exports.searchStores = async (req, res) => {
    const stores = await Store
        .find(
            { $text: { $search: req.query.q }},
            { score: { $meta: 'textScore' }}
        )
        .sort({ score: { $meta: 'textScore' }})
        .limit(5);

    res.json(stores);
}

exports.mapStores = async (req, res) => {
    const stores = await Store
        .find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [req.query.lng, req.query.lat].map(parseFloat)
                    },
                    $maxDistance: 10000 // 10km
                }
            }
        })
        .select('slug name description location photo');

    res.json(stores);
}

exports.showMap = (req, res) => {
    res.render('map', { title: 'Store Locator', stores: {} });
}

exports.heartStore = async (req, res) => {
    const hearts = req.user.hearts.map(obj => obj.toString());
    const isHearted = hearts.includes(req.params.id);
    const operator = isHearted ? '$pull' : '$addToSet';

    const user = await User.findByIdAndUpdate(req.user._id,
        { [operator]: { hearts: req.params.id } },
        { new: true }
    );

    res.json(user);
}

exports.getHeartedStores = async (req, res) => {
    const stores = await Store.find({
        _id: { $in: req.user.hearts }
    });

    res.render('getStores', { title: 'Hearted Stores', stores });
}

exports.getTopStores = async (req, res) => {
    const stores = await Store.getTopStores();

    res.render('topStores', { stores });
}