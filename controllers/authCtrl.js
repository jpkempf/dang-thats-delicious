const passport = require('passport');

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