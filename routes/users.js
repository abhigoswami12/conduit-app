var express = require('express');
var router = express.Router();

var User = require('../models/User');
var auth = require('../middlewares/auth');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });


//registration
router.post('/', async function(req, res, next) {
  try {
    var user = await User.create(req.body.user);
    // console.log("requested body", req.body)
    // console.log(user)
    var token = await auth.generateToken(user);
    res.json({ user : generateUserFormat(user, token)});
  } catch (error) {
    next(error);
  }
})


//login

router.post('/login', async (req, res, next) => {
  var { email, password } = req.body.user;
  if (!email || !password) {
    return res.status(400).json({ err: "email/password required" });
  }

  try {
    var user = await User.findOne({ email });
    console.log(user)
    if (!user) {
      return res.status(400).json({ msg: "email not registered" });
    }
    
    var result = await user.validatePassword(password);
    if (!result) {
      return res
        .status(400)
        .json({ err: " * Password is wrong! Please enter correct password!" });
    }

    var token = await auth.generateToken(user);
    res.json({ user: generateUserFormat(user, token) })
  } catch (error) {
    next(error);
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
