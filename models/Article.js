var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var slugify = require('slugify')

var articleSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        tagList: [{ type: String }],
        slug: { type: String },
        author: { type: Schema.Types.ObjectId, ref: "User"},
        comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
        favouritedBy: [{ type: Schema.Types.ObjectId, ref: "User"}],
        favouritesCount: {type: Number, default: 0},
        favourited: { type: Boolean, default: false },
        
        
        // author: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        // likes: {
        //     type: Number,
        //     default: 0
        // },
        // likesArray: [{ type: Schema.Types.ObjectId, ref: "User" }]
    },
    { timestamps: true }
);


articleSchema.pre('save', function(next) {
    if(this.title && this.isModified('title')) {
        //you can also use an npm package i.e. slugify
        this.slug = this.title.split(" ").join("-") + Math.floor(Math.random() * 20000);
        // this.slug = slugify(this.title);
    }
    next();
})

module.exports = mongoose.model("Article", articleSchema);

