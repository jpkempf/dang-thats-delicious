const mongoose = require('mongoose');
const crypto = require('crypto');
const passport = require('passport');
const promisify = require('es6-promisify');

const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    successFlash: 'You are now logged in.',
    failureFlash: 'Login failed!'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out! 👋');
    res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    req.flash('error', 'Please log in first! ⚠️');
    res.redirect('/login');
}

exports.forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        req.flash('error', `No user account found for ${req.body.email} ⚠️`);
        res.redirect('/login');
    }

    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

    req.flash('success', `You have been e-mailed a password reset link. <a href="${resetUrl}">Click here to continue to the next step</a>.`);
    res.redirect('/login');
}

exports.resetPassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Invalid or expired token. Please request a new one.');
        res.redirect('/login');
        return;
    }

    res.render('resetPassword', { title: 'Reset your password' });
}

exports.validatePassword = (req, res, next) => {
    if (req.body.password === req.body['password-confirm']) {
        return next();
    }

    req.flash('error', 'Passwords do not match 💥');
    res.redirect('back');
}

exports.updatePassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Invalid or expired token. Please request a new one.');
        res.redirect('/login');
        return;
    }

    const setPassword = promisify(user.setPassword, user);

    await setPassword(req.body.password);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();

    await req.login(updatedUser);

    req.flash('success', 'You have successfully updated your password.');
    res.redirect('/');
}