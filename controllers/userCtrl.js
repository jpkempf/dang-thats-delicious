const mongoose = require('mongoose');
const promisify = require('es6-promisify');

const User = mongoose.model('User');
const registerUser = promisify(User.register, User);

exports.registerForm = (req, res) => {
    res.render('registerForm', { title: 'Register' });
}

exports.loginForm = (req, res) => {
    res.render('loginForm', { title: 'Login' });
}

exports.validateRegistration = (req, res, next) => {
    req.checkBody('name', 'Please supply a name!').notEmpty();
    req.checkBody('email', 'Please supply a valid e-mail address!').isEmail();
    req.checkBody('password', 'Please supply a password!').notEmpty();
    req.checkBody('password-confirm', 'Please confirm your password!').notEmpty();
    req.checkBody('password-confirm', 'Passwords do not match!').equals(req.body.password);

    req.sanitizeBody('name');
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors.map(_ => _.msg));
        res.render('registerForm', {
            title: 'Register',
            name: req.body.name,
            email: req.body.email,
            flashes: req.flash()
        });
        return;
    }

    next();
}

exports.register = async (req, res, next) => {
    const user = new User({ name: req.body.name, email: req.body.email });
    await registerUser(user, req.body.password);
    next();
}

exports.account = (req, res) => {
    res.render('account', { title: 'Edit your account' });
}

exports.updateAccount = async (req, res) => {
    const updates = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: updates },
        {
            new: true,
            runValidators: true,
            context: 'query'
        }
    );

    req.flash('success', 'Account updated!');
    res.redirect('back');
}

exports.showHearts = (req, res) => {
    res.render('hearts', { title: 'Hearted Stores' });
}