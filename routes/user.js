var express = require('express');
var router = express.Router();
var User = require('../models/User');
var auth = require('../middlewares/auth');

router.get('/', auth.validateToken, async (req, res, next) => {
    var userId = req.user.userId;
    var token = req.user.token;
    try {
        var user = await User.findOne({ _id: userId })
        res.json({ user :  generateUserFormat(user, token)});
        
    } catch (error) {
        next(error);
    }
})


router.put('/', auth.validateToken, async (req, res, next) => {
    var token = req.user.token;
    try {
        var updatedUser = await User.findByIdAndUpdate(req.user.userId, req.body.user);
        return res.json({ user: generateUserFormat(updatedUser, token)})
    } catch (error) {
        next(error)
    }
})

function generateUserFormat(user, token) {
    return {
        email: user.email,
        token,
        bio: user.bio,
        image: user.image,
        username: user.username
    }
}

module.exports = router;