const jwt = require('jsonwebtoken');

module.exports = {
    CheckAuthorized(req, res, next) {
        console.log("middleware call");
        var isAuthorized = false;
        console.log(req.cookies);
        if (req.cookies.tokenAuthorized != undefined) {
            try {
                jwt.verify(req.cookies.tokenAuthorized, process.env.PRIVATE_KEY, (err, authData) => {
                    if (!err) {
                        console.log("Login Success");
                        isAuthorized = true;
                        res.locals.user = authData;
                        
                    }
                })
            } catch (e) {}
        }
        res.locals.isAuthorized = isAuthorized;
        return next();
    }
}


