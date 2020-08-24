var express = require('express');
var router = express.Router();

var Article = require('../models/Article');
var auth = require('../middlewares/auth');
var Comment = require('../models/Comment');
var User = require('../models/User');

//create article
router.post('/',auth.validateToken, async (req, res, next) => {
    req.body.article.author = req.user.userId;
    try {
        var article = await Article.create(req.body.article);
        // article.author = req.user.userId;
        // res.json({ article: generateArticleFormat(article)});
        var populatedArticle = await Article.findById(article._id).populate('author', "-_id username bio image following").exec()
        res.json({ article: generateArticleFormat(populatedArticle) })
    } catch (error) {
        next(error);
    }
})

//create commnent
router.post('/:slug/comments',auth.validateToken, async (req, res, next) => {
    var slug = req.params.slug;
    req.body.comment.author = req.user.userId;
    var article = await Article.findOne({ slug });
    req.body.comment.articleId = article._id;
    try {
        var comment = await Comment.create(req.body.comment);
        await Article.findOneAndUpdate({ slug }, { $push: { comments: comment._id}});
        // var populatedComment = await Comment.findOne({ author: req.user.userId}).populate("author").exec();
        var populatedComment = await Comment.findById(comment._id)
          .populate("author", "-_id bio image username following")
          .exec();
        res.json({ comment: populatedComment });
    } catch (error) {
        next(error);
    }
})

//get all articles
//DOUBT: What is the role of default values in offset and limit
router.get('/', async (req, res, next) => {

    var query = {};
    var limit = +req.query.limit || 20;
    var offset = +req.query.offset || 0;
    

    if (req.query.author) {
        var username = req.query.author;
        var user = await User.findOne({ username });
        query.author = user._id;
    }
    if (req.query.favourited) {
        console.log(req.query.favourited);
        var username = req.query.favourited;
        var user = await User.findOne({ username });
        console.log(user)
        query._id = {$in: user.favourites}
        console.log("FAVOURITES",query._id);
    }
    if (req.query.tag) {
        var tag = req.query.tag;
        query.tagList = tag
    }
    console.log('QUERY', query)
    try {
        var articles = await Article.find(query).sort({ createdAt: -1}).populate("author", "username bio image").limit(limit).skip(offset);
        res.json({ articles });
        
    } catch (error) {
        next(error)
    }

    //METHOD-2 TO ACCESS QUERY PARAMETERS
    // try {
    //     if (req.query.author) {
    //         // console.log(req.query)
    //         var username = req.query.author;
    //         var user = await User.findOne({ username });
    //         var userId = user._id;
    //         // var articles = await Article.find({ author: userId }).sort({ createdAt: -1 }).populate("author", "username bio image");
    //         // res.json({ articles });

    //     } else if (req.query.limit) {
    //         // console.log(req.query.limit);
    //         var limit = +req.query.limit || 20;
    //         // console.log(typeof limit)
    //         var articles = await Article.find().sort({ "createdAt": -1 }).populate('author', 'username bio image').limit(limit);
    //         res.json({ articles });

    //     } else if (req.query.offset) {
    //         var offset = +req.query.offset || 0;
    //         // console.log(offset)
    //         var articles = await Article.find().sort({ "createdAt": -1 }).populate('author', 'username bio image').skip(offset);
    //         res.json({ articles });
    //     } else if (req.query.favourited) {
    //         var username = req.query.favourited;
    //         // console.log(username);
    //         var user = await User.findOne({ username });
    //         // console.log(user);
    //         // var articles = await Article.find({ _id: { $in: user.favourites } }).sort({ "createdAt": -1 }).populate('author', 'username bio image');
    //         // console.log("Articles", articles);
    //         // res.json({ articles })

    //     } else if (req.query.tag) {
    //         var tag = req.query.tag;
    //         // console.log(tag)
    //         // var articles = await Article.find({ tagList: tag });
    //         // console.log(articles);
    //         // res.json({ articles });
    //     } else {
    //         var articles = await Article.find({}, "-_id -favourites -comments -favouritedBy").sort({ "createdAt": -1 }).populate('author', 'username bio image').exec();
    //         return res.json({ articles })
    //     }
    //     // console.log(user);
    // } catch (error) {
    //     next(error);
    // }
    
})

//feed articles
router.get('/feed',auth.validateToken, async (req, res, next) => {
    try {
        var user = await User.findOne({ _id: req.user.userId });
        var articles = await Article.find({ author: { $in: user.followings }}).sort({ "createdAt": -1}).populate('author', 'username bio image').exec();
        res.json({ articles })
        
    } catch (error) {
        next(error);
    }
})


//read single article
router.get('/:slug', async (req, res, next) => {
    var slug = req.params.slug;
    
    try {
        var article = await Article.findOne({slug}).populate('author', '-_id bio image username following').exec();
        // res.json({ article: generateArticleFormat(article) });
        res.json({article : generateArticleFormat(article)});
    } catch (error) {
        next(error);
    }

})

//read all comments of an article
router.get('/:slug/comments', async (req, res, next) => {
    var slug = req.params.slug;
    try {
        var article = await Article.findOne({ slug }).populate('comments');
        var articleComments = article.comments;
        res.json({comments: articleComments});
    } catch (error) {
        next(error);
    }
})




//update article
//make sure that,only author of that article can delete or update that article
router.put('/:slug',auth.validateToken, async(req, res, next) => {
    var slug = req.params.slug;
    try {
        // var updatedArticle = await Article.findOneAndUpdate({ slug }, req.body.article);
        // // res.json({ article: generateArticleFormat(updatedArticle) });
        // res.json({ updatedArticle });
        var article = await Article.findOne({ slug });
        if(article.author.toString() === req.user.userId) {
            article.title = req.body.article.title;
            // article.description = req.body.article.description;
            // article.body = req.body.article.body;
            article.save();
            res.json({ article: generateArticleFormat(article) });

        } else {
            res.json({msg: "you must be the author of the article to update it"})
        }
    } catch (error) {
        next(error);
    }
})

//delete article
router.delete('/:slug',auth.validateToken, async(req, res, next) => {
    var slug = req.params.slug;
    try {
        // var deletedArticle = await Article.findOneAndDelete({ slug });
        // res.json({deletedArticle});
        var article = await Article.findOne({ slug });
        if(article) {
            if(article.author.toString() === req.user.userId) {
                // var comments = await Comment.find({ _id: article.comments});
                // comments.forEach(comment => comment.remove());
                article.remove();
                res.json({ article });
            } else {
                res.status(400).json({ msg: "you must be the author of the article to update it" })
            }

        } else {
            res.status(400).json({ msg: "Article already deleted!!" })
        }
        await Comment.deleteMany({ articleId: article._id });
    } catch (error) {
        next(error);
    }
})

//delete comments
router.delete('/:slug/comments/:id', auth.validateToken, async (req, res, next) => {
    var slug = req.params.slug;
    var commnentId = req.params.id;
    try {
        var comment = await Comment.findById(commnentId);
        if (comment) {
            if(comment.author.toString() === req.user.userId){
                comment.remove();
                res.json({ comment });
    
                var article = await Article.findOneAndUpdate({ slug }, { $pull: { comments: commnentId } });

            } else {
                res.status(400).json({ msg: "you must be the author of the comment to delete it" });
            }

        } else {
            res.status(400).json({ msg: 'comments already deleted!!' });
        }

    } catch (error) {
        next(error);
    }



})

//favourites
//doubt: how to remove unwanted information from res.json
router.post("/:slug/favourite",auth.validateToken, async (req, res, next) => {
    var slug = req.params.slug;
    try {
        var loggedinUserId = req.user.userId
        var loggedinUser = await User.findOne({ _id: loggedinUserId });
        var articleToBeUpdated = await Article.findOne({ slug }).populate("author", "-_id bio username image").exec();
        if(!articleToBeUpdated.favouritedBy.includes(req.user.userId)) {
            articleToBeUpdated.favouritedBy.push(req.user.userId);
            articleToBeUpdated.favouritesCount += 1;
            articleToBeUpdated.favourited = true;
            articleToBeUpdated.save();
        }
        if (!loggedinUser.favourites.includes(articleToBeUpdated._id)) {
            loggedinUser.favourites.push(articleToBeUpdated._id);
            loggedinUser.save();
        }
        res.json({ articleToBeUpdated });
        
    } catch (error) {
        next(error);
    }
})
//unfavourite
router.delete("/:slug/unfavourite", auth.validateToken, async (req, res, next) => {
    var slug = req.params.slug;
    try {
        var loggedinUserId = req.user.userId;
        var loggedinUser = await User.findOne({ _id: loggedinUserId });
        var articleToBeUpdated = await Article.findOne({ slug }).populate("author", "-_id bio username image").exec();
        if (articleToBeUpdated.favouritedBy.includes(req.user.userId)) {
            articleToBeUpdated.favouritedBy.pull(req.user.userId);
            articleToBeUpdated.favouritesCount -= 1;
            articleToBeUpdated.favourited = false;
            articleToBeUpdated.save();
        }
        if (loggedinUser.favourites.includes(articleToBeUpdated._id)) {
          loggedinUser.favourites.pull(articleToBeUpdated._id);
          loggedinUser.save();
        }
        res.json({ articleToBeUpdated });

    } catch (error) {
        next(error);
    }
})






function generateArticleFormat(article) {
    return {
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
        slug: article.slug,
        favourited: article.favourited,
        favouritesCount: article.favouritesCount,
        author: article.author,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
    }
}

module.exports = router;