var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bcrypt = require('bcrypt');

var userSchema = new Schema({
    email:{type: String, required: true, unique: true},
    bio: {type: String, default: null},
    username:{type: String, required: true, unique: true},
    password: {type: String, required: true},
    image:{type: String, default: null},
    following: { type: Boolean, default: false },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followings: [{ type: Schema.Types.ObjectId,ref: "User" }],
    favourites: [{ type: Schema.Types.ObjectId, ref: "Article" }],
})

userSchema.pre('save', function (next) {
    // console.log(this);//as soon as request comes to user.Create, if a pre savehook is defined then first it will be executed.Here, we presave hook is still not sending any request , so user.create willlnot be executed.however all validations and id will be assigned here only.simultaneously do console.log in user.create,one without next() and other using next();
    if (this.password && this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, 10)
    }
    next();
});

userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);// returns true or false
}


module.exports = mongoose.model('User', userSchema);