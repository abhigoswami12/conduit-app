var jwt = require('jsonwebtoken');

module.exports = {
    generateToken : async function(user) {

        var payload = {
            userId : user.id,
            username : user.username,
            email: user.email,
        }


        var token = await jwt.sign(payload, process.env.SECRET);
        return token;
    },
    validateToken: async (req, res, next) => {
        var token = req.headers.authorization || "";
        if(token) {
        try {
            var payload = jwt.verify(token, process.env.SECRET);
            req.user = { ...payload, token };
            next();
            
        } catch (error) {
            return res.status(400).json({ msg: "Invalid Token" });
        }

        } else {
             res.status(400).json({ msg: "Token required"})
        }
    }
}