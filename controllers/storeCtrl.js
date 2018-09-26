const mongoose = require('mongoose');
const Store = mongoose.model('Store');
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

exports.homePage = (req, res) => {
    res.render('index');
}

exports.getStores = async (req, res) => {
    const stores = await Store.find();

    res.render('getStores', { title: 'Stores', stores });
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
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully created store ${store.name}!`);
    res.redirect(`/store/${store.slug}`);
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
    res.redirect(`/store/${store.slug}`);
}

exports.editStore = async (req, res) => {
    const store = await Store.findById(req.params.id);

    res.render('editStore', { title: `Edit ${store.name}`, store });
}
