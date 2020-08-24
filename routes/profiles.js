var express = require("express");
var router = express.Router();

var Article = require("../models/Article");
var auth = require("../middlewares/auth");
var Comment = require("../models/Comment");
var User = require('../models/User');

router.get('/:username',auth.validateToken, async (req, res, next) => {
    var username = req.params.username;
    try {
        var user = await User.findOne({ username }, "-_id -password -email -followers -followings");
        res.json({ user });
    } catch (error) {
        next(error);
    }
})

//follow
//DOUBT: HOW TO REMOVE ID AND FOLLOWERS FROM RES.JSON
router.post('/:username/follow', auth.validateToken, async(req, res, next) => {
    var username = req.params.username;
    try {
        var loggedinUserId = req.user.userId;
        var loggedinUser = await User.findOne({ _id: loggedinUserId });
        var userToBeUpdated = await User.findOne({ username });
        var followersList = userToBeUpdated.followers;
        if(!followersList.includes(req.user.userId)) {
            userToBeUpdated.followers.push(req.user.userId);
            userToBeUpdated.following = true;
            userToBeUpdated.save();
        }
        if(!loggedinUser.followings.includes(userToBeUpdated._id)) {
            loggedinUser.followings.push(userToBeUpdated._id);
            loggedinUser.save();
        }
        res.json({profile: userToBeUpdated});

    } catch (error) {
        next(error);
    }
})

//unfollow
router.delete('/:username/unfollow', auth.validateToken, async (req, res, next) => {
    var username = req.params.username;
    try {
        var loggedinUserId = req.user.userId;
        var loggedinUser = await User.findOne({ _id: loggedinUserId });
        var userToBeUpdated = await User.findOne({ username });
        
        var followersList = userToBeUpdated.followers;
        if (followersList.includes(req.user.userId)) {
            userToBeUpdated.followers.pull(req.user.userId);
            userToBeUpdated.following = false;
            userToBeUpdated.save();

        }
        if (loggedinUser.followings.includes(userToBeUpdated._id)) {
            loggedinUser.followings.pull(userToBeUpdated._id);
            loggedinUser.save();
        }
        res.json({profile: userToBeUpdated});

    } catch (error) {
        next(error);
    }
})



module.exports = router;