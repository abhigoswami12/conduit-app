var express = require('express');
var router = express.Router();

var Article = require('../models/Article');

router.get('/', async (req, res, next) => {
    try {
        var tags = await Article.find().distinct("tagList");
        res.json({ tags });
    } catch (error) {
        next(error);
    }
})

module.exports = router;