const mongoose = require('mongoose');
const Store = mongoose.model('Store');

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

exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully created store ${store.name}!`)
    res.redirect(`/store/${store.slug}`);
}

exports.updateStore = async (req, res) => {
    const store = await Store.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    ).exec();

    req.flash('success', `Changes to ${store.name} saved!`)
    res.redirect(`/store/${store.slug}`);
}

exports.editStore = async (req, res) => {
    const store = await Store.findById(req.params.id);

    res.render('editStore', { title: `Edit ${store.name}`, store });
}
