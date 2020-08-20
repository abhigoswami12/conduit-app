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
        // console.log("USER", user);
        res.json({ user });
    } catch (error) {
        next(error);
    }
})

//follow
//DOUBT: HOW TO REMOVE ID AND FOLLOWERS FROM RES.JSON
router.post('/:username/follow', auth.validateToken, async(req, res, next) => {
    var username = req.params.username;
    // console.log("REQUESTED USER",req.user)
    try {
        var loggedinUserId = req.user.userId;
        // console.log(loggedinUserId);
        var loggedinUser = await User.findOne({ _id: loggedinUserId });
        console.log("loggedinUser", loggedinUser);
        var userToBeUpdated = await User.findOne({ username });
        console.log("userToBeUpdated", userToBeUpdated);
        var followersList = userToBeUpdated.followers;
        if(!followersList.includes(req.user.userId)) {
            userToBeUpdated.followers.push(req.user.userId);
            userToBeUpdated.following = true;
            userToBeUpdated.save();
        }
        if(!loggedinUser.followings.includes(userToBeUpdated._id)) {
            loggedinUser.followings.push(userToBeUpdated._id);
            loggedinUser.save();
            console.log("loggedinUser again", loggedinUser);
        }
        res.json({profile: userToBeUpdated});

    } catch (error) {
        next(error);
    }
})

//unfollow
router.delete('/:username/unfollow', auth.validateToken, async (req, res, next) => {
    var username = req.params.username;
    console.log("REQUESTED USER",req.user)
    try {
        var loggedinUserId = req.user.userId;
        // console.log(loggedinUserId)
        var loggedinUser = await User.findOne({ _id: loggedinUserId });
        console.log("loggedinUser", loggedinUser);
        var userToBeUpdated = await User.findOne({ username });
        
        console.log("userToBeUpdated", userToBeUpdated);
        var followersList = userToBeUpdated.followers;
        if (followersList.includes(req.user.userId)) {
            userToBeUpdated.followers.pull(req.user.userId);
            userToBeUpdated.following = false;
            userToBeUpdated.save();

        }
        if (loggedinUser.followings.includes(userToBeUpdated._id)) {
            loggedinUser.followings.pull(userToBeUpdated._id);
            loggedinUser.save();
            console.log("loggedinUser again", loggedinUser);
        }
        res.json({profile: userToBeUpdated});

    } catch (error) {
        next(error);
    }
})



module.exports = router;