const jwt = require('jsonwebtoken');

const PRIVATE_KEY = "5E884898DA28047151D0E56F8DC6292773603D0D6AABBDD62A11EF721D1542D8";

module.exports = {
    isAuthorized(req, res, next) {
        console.log("middleware call");
        var isAuthorized = false;
        if (req.cookies.tokenAuthorized) {
            try {
                jwt.verify(req.cookies.tokenAuthorized, PRIVATE_KEY, (err, authData) => {
                    if (!err) {
                        console.log("Login Success");
                        isAuthorized = true;
                    }
                })
            } catch (e) {}
        }
        res.locals.post = isAuthorized;
        return next();

    }
}


