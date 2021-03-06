const express = require('express');
const secured = require('../lib/middleware/secured');
const router = express.Router();

/* GET users listing. */

router.get('/', function (req, res, next) {
    //res.send('respond with a resource');
});

/* GET user profile. */
router.get('/user', secured, function (req, res, next) {
    const { _raw, _json, ...userProfile } = req.user;
    res.render('user', {
        userProfile: JSON.stringify(userProfile, null, 2),
        title: 'Profile page'
    });
});

module.exports = router;