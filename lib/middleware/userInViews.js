//userInViews.js

const userInViews = (req, res, next) => {
    res.locals.user = req.user;
    next();
};

module.exports = userInViews;